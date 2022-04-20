import { ObjectId } from "mongodb";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { ActivityType, IActivity } from "../interfaces/IActivity";
import { ContentType, INFT, MintStatus, SaleStatus, TokenType } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
import { uploadImage, uploadImageBase64 } from "../util/morailsHelper";
import { dateDiff } from "../util/datediff-helper";
import { v4 } from "uuid";
/**
 * This is the NFT controller class.
 * Do all the NFT's functions such as
 * get item detail, history, create and transfer.
 *
 * @param {INFT} data INFT data
 *
 * @property {data}
 * @property {table}
 * @property {personTable}
 * @property {historyTable}
 * @property {nftCollectionTable}
 *
 * @method getItemDetail
 * @method getItemHistory
 * @method getItems
 * @method createNFT
 * @method findNFTItem
 * @method findCollection
 * @method findPerson
 *
 * @author Tadashi <tadashi@depo.io>
 * @version 0.0.1
 *
 * ----
 * Example Usage
 *
 * const ctl = new NFTController();
 *
 * await ctl.getItemDetail('0xbb6a549b1cf4b2d033df831f72df8d7af4412a82', 3)
 *
 */
export class NFTController extends AbstractEntity {
  protected data: INFT;
  protected table: string = "NFT";
  private personTable: string = "Person";
  private activityTable: string = "Activity";
  private nftCollectionTable: string = "NFTCollection";
  /**
   * Constructor of class
   * @param nft NFT item data
   */
  constructor(nft?: INFT) {
    super();
    this.data = nft;
  }
  /**
   * Get NFT item detail information
   *
   * @param collectionId Collection Contract Address
   * @param index NFT item index
   * @returns INFT object including NFT item information
   */
  async getItemDetail(collectionId: string, index: number): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findNFTItem(collectionId, index);
        const acttable = this.mongodb.collection(this.activityTable);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const itemTable = this.mongodb.collection(this.table);
        const result = await itemTable.findOne(query);
        if (result) {
          const personTable = this.mongodb.collection(this.personTable);
          const owner = await personTable.findOne({ wallet: result.owner });
          const collectionData = await collTable.findOne({ _id: new ObjectId(result.collection) });
          const act = await acttable.findOne(
            { collection: result.collection, nftId: result.index },
            { limit: 1, sort: { startDate: -1 } }
          );
          let timeDiff = "";
          if (act && act.endDate) {
            timeDiff = dateDiff(new Date().getTime(), act.endDate);
          }
          if (!act) {
            const collectionAct = (await acttable.findOne({
              collection: result.collection,
              type: ActivityType.OFFERCOLLECTION,
            })) as IActivity;
            if (collectionAct && collectionAct.endDate)
              timeDiff = dateDiff(new Date().getTime(), collectionAct.endDate);
          }
          result.collectionId = result.collection;
          result.collection = collectionData.contract;
          result.creatorEarning = collectionData.creatorEarning;
          result.timeLeft = timeDiff;
          result.ownerDetail = owner;
          if (result && result.tokenType == "ERC1155") {
            let own = result.owners ?? [];
            let ownD = [];
            if (own.indexOf(owner) == -1) own.push(result.owner);
            ownD.push(result.ownerDetail);
            result.owners = own;
            result.ownersDetail = ownD;
          }
          return respond(result);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Get NFT item history
   * @param collectionId Collection Contract Address
   * @param nftId NFT item index in collection
   * @returns Array<IActivity>
   */
  async getItemHistory(collectionId: string, index: number): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const query = this.findNFTItem(collectionId, index);
        const result = (await nftTable.findOne(query)) as INFT;
        if (result) {
          const activityTable = this.mongodb.collection(this.activityTable);
          const history = await activityTable
            .find({
              collection: collectionId,
              nftId: result.index,
              // $or: [{ type: "Sold" }, { type: "Transfer" }],
            })
            .toArray();
          return respond(history);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Get NFT item Offers
   * @param collection Collection Contract Address
   * @param index NFT item index in collection
   * @returns Array<IActivity>
   */
  async getItemOffers(collectionId: string, index: number): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const activityTable = this.mongodb.collection(this.activityTable);
        const query = this.findNFTItem(collectionId, index);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const result = (await nftTable.findOne(query)) as INFT;
        if (result) {
          const offersIndividual = await activityTable
            .find({
              collection: collectionId,
              nftId: result.index,
              $or: [{ type: ActivityType.LIST }, { type: ActivityType.OFFER }],
              active: true,
            })
            .toArray();
          const resultOffersInvidual = await Promise.all(
            offersIndividual.map(async (item) => {
              const col = await collTable.findOne({ _id: new ObjectId(item.collection) });
              item.collectionId = item.collection;
              item.collection = col.contract;
              return { ...item };
            })
          );
          const offersCollection = await activityTable
            .find({
              collection: collectionId,
              type: ActivityType.OFFERCOLLECTION,
            })
            .toArray();
          return respond(resultOffersInvidual.concat(offersCollection));
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Get all NFTs in collection
   * @param filters filter
   * @returns Array<INFT>
   */
  async getItems(filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const acttable = this.mongodb.collection(this.activityTable);
        // const result = await nftTable.find().toArray();
        let aggregation = {} as any;
        if (filters) {
          aggregation = this.parseFilters(filters);
        }
        const result = (await nftTable.aggregate(aggregation).toArray()) as Array<INFT>;
        if (result) {
          const resultsNFT = await Promise.all(
            result.map(async (item) => {
              const act = await acttable.findOne(
                {
                  collection: item.collection,
                  nftId: item.index,
                },
                {
                  limit: 1,
                  sort: {
                    startDate: -1,
                  },
                }
              );
              let timeDiff = "";
              if (act && act.endDate) {
                timeDiff = dateDiff(new Date().getTime(), act.endDate);
              }
              if (!act) {
                const collectionAct = (await acttable.findOne({
                  collection: item.collection,
                  type: ActivityType.OFFERCOLLECTION,
                })) as IActivity;
                if (collectionAct && collectionAct.endDate)
                  timeDiff = dateDiff(new Date().getTime(), collectionAct.endDate);
              }
              item.timeLeft = timeDiff;
              const collection = (await collTable.findOne({ _id: new ObjectId(item.collection) })) as INFTCollection;
              const actData = await acttable
                .find({ collection: item.collection, nftId: item.index, type: { $in: [ActivityType.OFFER] } })
                .toArray();
              return {
                ...item,
                collection_details: {
                  _id: collection._id,
                  contract: collection.contract,
                  name: collection.name,
                  platform: collection.platform,
                },
                offer_lists: actData,
              };
            })
          );
          return respond(resultsNFT);
        }
        return respond("Items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Get all trending NFTs in collection
   * @param filters filter
   * @returns Array<INFT>
   */
  async getTrendingItems(filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const activityTable = this.mongodb.collection(this.activityTable);
        let aggregation = {} as any;
        if (filters) {
          aggregation = this.parseFilters(filters);
        }
        const result = (await nftTable.aggregate(aggregation).toArray()) as Array<INFT>;
        if (result) {
          const resultsNFT = await Promise.all(
            result.map(async (item) => {
              const collection = (await collTable.findOne({ _id: new ObjectId(item.collection) })) as INFTCollection;
              const activity = (await activityTable
                .find({
                  collection: item.collection,
                  nftId: item.index,
                  type: ActivityType.OFFER,
                })
                .toArray()) as Array<IActivity>;
              const collectionAct = (await activityTable.findOne({
                collection: item.collection,
                type: ActivityType.OFFERCOLLECTION,
              })) as IActivity;
              activity.push(collectionAct);
              return {
                ...item,
                collection_details: {
                  _id: collection._id,
                  contract: collection.contract,
                  name: collection.name,
                  platform: collection.platform,
                },
                counts: activity.length,
              };
            })
          );
          return respond(resultsNFT.sort((item1, item2) => item2.counts - item1.counts).slice(0, 10));
        }
        return respond("Items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Create NFT item - save to NFT table in db
   * It check collection, owner and creator.
   * After that it create new INFT object and insert it to collection
   * Also it adds this nft to the owner's nft and creator's created
   * Then it adds nft item to the collection
   *
   * @param contract
   * @param nftId
   * @param artURI
   * @param price
   * @param ownerAddr
   * @param creatorAddr
   * @returns
   */
  async createNFT(
    artFile,
    name,
    externalLink,
    description,
    collectionId,
    properties,
    unlockableContent,
    isExplicit,
    tokenType,
    artName,
    contentType,
    mimeType,
    owner
  ): Promise<IResponse> {
    const nftTable = this.mongodb.collection(this.table);
    const collectionTable = this.mongodb.collection(this.nftCollectionTable);
    const ownerTable = this.mongodb.collection(this.personTable);

    try {
    if (!ObjectId.isValid(collectionId)) {
      return respond("Invalid Collection Id", true, 422);
    }

    
    // const artIpfs = artFile ? await uploadImageBase64({ name: artName, img: artFile }) : "";
    const artIpfs = artFile? await uploadImage({name:artName,img:artFile,contentType:mimeType}):"";
    let queryArt = this.findNFTItemByArt(artIpfs);
    const findResult = (await nftTable.findOne(queryArt)) as INFT;
    if (findResult && findResult._id) {
      return respond("Current nft has been created already", true, 422);
    }
    // let query = this.findNFTItemByArt(artFile);
    // const findResult = (await nftTable.findOne(query)) as INFT;
    // if (findResult && findResult._id) {
    //   return respond("Current nft has been created already", true, 501);
    // }
    let query = this.findCollectionById(collectionId);
    const collection = (await collectionTable.findOne(query)) as INFTCollection;
    if (!collection) {
      return respond("collection not found.", true, 422);
    }
    const sortNft = await nftTable.findOne({}, { limit: 1, sort: { index: -1 } });
    let newIndex = sortNft ? sortNft.index + 1 : 0;
    let own = [];
    own.push(owner);
    // const url = await uploadImage(artFile);
    const nft: INFT = {
      collection: collectionId,
      index: newIndex,
      owner: owner,
      owners: own,
      creator: owner,
      artURI: artIpfs,
      price: 0,
      name: name ?? "",
      externalLink: externalLink ?? "",
      description: description ?? "",
      isExplicit: isExplicit ?? false,
      saleStatus: SaleStatus.NOTFORSALE,
      mintStatus: MintStatus.LAZYMINTED,
      status_date: new Date().getTime(),
      properties: properties?JSON.parse(properties): {},
      lockContent: unlockableContent,
      tokenType: tokenType == "ERC721" ? TokenType.ERC721 : TokenType.ERC1155,
      contentType:
        contentType === "music"
          ? ContentType.MUSIC
          : contentType === "image"
          ? ContentType.IMAGE
          : contentType === "video"
          ? ContentType.VIDEO
          : ContentType.IMAGE,
    };


    console.log('-->>>>>>>>',nft)
    const result = await nftTable.insertOne(nft);
    if (result) nft._id = result.insertedId;
    return result ? respond(nft) : respond("Failed to create a new nft.", true, 501);
  } catch(err){
    console.log(err);
  }
  }
  /**
   * Delete  collection
   * @param collectionId collection Id
   * @returns
   */
  async deleteItem(id: string, ownerId: string) {
    try {
      if (!ObjectId.isValid(id)) {
        return respond("Invalid itemId ", true, 422);
      }
      const acttable = this.mongodb.collection(this.activityTable);
      const nftTable = this.mongodb.collection(this.table);
      const itemData = await nftTable.findOne({ _id: new ObjectId(id) });
      if (!itemData) {
        return respond("Items not Found", true, 422);
      }
      if (itemData?.owner.toLowerCase() !== ownerId) {
        return respond("this item not belong to this user", true, 422);
      }
      const actData = await acttable.findOne({ nftId: itemData.index });
      if (actData) {
        return respond("This item  has activity", true, 422);
      }
      const deleteItem = await nftTable.remove({ _id: new ObjectId(id) });
      return respond(`Item ${id} has been removed`);
    } catch (e) {
      return respond(e.message, true, 401);
    }
  }
  async updateNFT(id: string, nft: any) {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.table);
        const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { ...nft } });
        return respond(result);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Mounts a generic query to find an item by its collection contract and index.
   * @param collectionId
   * @returns
   */
  private findNFTItem(collectionId: string, index: number): Object {
    return {
      collection: collectionId,
      index,
    };
  }
  /**
   * Mounts a generic query to find an item by its collection contract and index.
   * @param contract
   * @returns
   */
  private findNFTItemByArt(art: string): Object {
    return {
      artURI: art,
    };
  }
  /**
   * Mounts a generic query to find a collection by contract address.
   * @param contract
   * @returns
   */
  private findCollection(contract: string): Object {
    return {
      contract: contract,
    };
  }
  /**
   * Mounts a generic query to find a collection by contract address.
   * @param contract
   * @returns
   */
  private findCollectionById(id: string): Object {
    return {
      _id: new ObjectId(id),
    };
  }
  /**
   * Mounts a generic query to find a person by wallet address.
   * @param contract
   * @returns
   */
  private findPerson(address: string): Object {
    return {
      wallet: address,
    };
  }
}
