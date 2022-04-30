import { ObjectId } from "mongodb";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { ActivityType, IActivity } from "../interfaces/IActivity";
import { ContentType, INFT, MintStatus, SaleStatus, TokenType } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
import { dateDiff } from "../util/datediff-helper";
import { S3uploadImageBase64 } from "../util/aws-s3-helper";
import { IGlobal } from "../interfaces/IGlobal";

export class NFTController extends AbstractEntity {
  protected data: INFT;
  protected table: string = "NFT";
  private personTable: string = "Person";
  private activityTable: string = "Activity";
  private nftCollectionTable: string = "NFTCollection";
  private globaltable: string = "Global";

  constructor(nft?: INFT) {
    super();
    this.data = nft;
  }

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
              // active:true,
              $or: [{ type: { $ne: ActivityType.OFFERCOLLECTION } }, { type: { $ne: ActivityType.CANCELOFFER } }],
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

  async getItemOffers(collectionId: string, index: number): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const activityTable = this.mongodb.collection(this.activityTable);
        const query = this.findNFTItem(collectionId, index);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const result = (await nftTable.findOne(query)) as INFT;
        if (result) {
          let rst = [];
          const offersIndividual = await activityTable
            .find({
              collection: collectionId,
              nftId: result.index,
              $or: [{ type: ActivityType.LIST }, { type: ActivityType.OFFER }, { type: ActivityType.OFFERCOLLECTION }],
              active: true,
            })
            .toArray();
          const resultOffersInvidual = await Promise.all(
            offersIndividual.map(async (item) => {
              if (item && item.nftId) {
                const col = await collTable.findOne({ _id: new ObjectId(item.collection) });
                const nfts = (await nftTable.findOne({ collection: item.collection, index: item.nftId })) as INFT;
                item.collectionId = item.collection;
                item.collection = col.contract;
                item.nft = { artURI: nfts.artURI, name: nfts.name };
                rst.push(item);
              }
              return item;
            })
          );
          // const offersCollection = await activityTable
          //   .find({
          //     collection: collectionId,
          //     type: ActivityType.OFFERCOLLECTION,
          //   })
          //   .toArray();
          // return respond(resultOffersInvidual.concat(offersCollection));
          return respond(rst);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }

  async getItems(filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const acttable = this.mongodb.collection(this.activityTable);
        let aggregation = {} as any;
        aggregation = this.parseFiltersFind(filters);
        let result = [] as any;
        let count;

        if (aggregation && aggregation.filter) {
          count = await nftTable.find({ $or: aggregation.filter }).count();
          result = aggregation.sort
            ? ((await nftTable
                .find({ $or: aggregation.filter })
                .sort(aggregation.sort)
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>)
            : ((await nftTable
                .find({ $or: aggregation.filter })
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>);
        } else {
          count = await nftTable.find().count();
          result = aggregation.sort
            ? await nftTable.find({}).sort(aggregation.sort).skip(aggregation.skip).limit(aggregation.limit).toArray()
            : ((await nftTable.find({}).skip(aggregation.skip).limit(aggregation.limit).toArray()) as Array<INFT>);
        }
        //  result = (await nftTable.aggregate(aggregation).toArray()) as Array<INFT>;
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
                .find({
                  collection: item.collection,
                  nftId: item.index,
                  type: { $in: [ActivityType.OFFER, ActivityType.OFFERCOLLECTION] },
                })
                .toArray();
              return {
                ...item,
                collection_details: {
                  _id: collection?._id,
                  contract: collection?.contract,
                  name: collection?.name,
                  platform: collection?.platform,
                  logoURL: collection?.logoUrl,
                },
                offer_lists: actData,
              };
            })
          );
          let rst = {
            success: true,
            status: "ok",
            code: 200,
            count: count,
            currentPage: aggregation.page,
            data: resultsNFT,
          };
          return rst;
        }
        return respond("Items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 422);
    }
  }

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
                  _id: collection?._id,
                  contract: collection?.contract,
                  name: collection?.name,
                  platform: collection?.platform,
                  logoURL: collection?.logoUrl,
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
    const globalTable = this.mongodb.collection(this.globaltable);
    try {
      if (!ObjectId.isValid(collectionId)) {
        return respond("Invalid Collection Id", true, 422);
      }
      let query = this.findCollectionById(collectionId);
      const collection = (await collectionTable.findOne(query)) as INFTCollection;
      if (!collection) {
        return respond("collection not found.", true, 422);
      }
      if (collection && collection.blockchain != tokenType) {
        return respond(`Token Type Should be ${collection.blockchain}`, true, 422);
      }
      const artIpfs = artFile ? await S3uploadImageBase64(artFile, `${artName}_${Date.now()}`, mimeType, "item") : "";
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
      const nftVar = (await globalTable.findOne({ globalId: "nft" }, { limit: 1 })) as IGlobal;
      // const sortNft = await nftTable.findOne({}, { limit: 1, sort: { index: -1 } });
      let newIndex = nftVar && nftVar.nftIndex ? nftVar.nftIndex + 1 : 0;
      if (nftVar) {
        await globalTable.replaceOne({ globalId: "nft" }, { globalId: "nft", nftIndex: newIndex });
      } else {
        await globalTable.insertOne({
          globalId: "nft",
          nftIndex: newIndex,
        });
      }
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
        properties: properties ? JSON.parse(properties) : {},
        lockContent: unlockableContent ?? false,
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
      const result = await nftTable.insertOne(nft);
      if (result) nft._id = result.insertedId;
      return result ? respond(nft) : respond("Failed to create a new nft.", true, 501);
    } catch (err) {}
  }

  async bulkUpload(collectionUrl: string, owner: string, records: any[]) {
    const globalTable = this.mongodb.collection(this.globaltable);
    const collectionTable = this.mongodb.collection(this.nftCollectionTable);
    const nftTable = this.mongodb.collection(this.table);

    try {
      const collection: INFTCollection = await collectionTable.findOne({ url: collectionUrl });
      if (!collection) return respond("Collection is not exsiting. Please check URL");

      for (const record of records) {
        const nftVar = (await globalTable.findOne({ globalId: "nft" }, { limit: 1 })) as IGlobal;
        const newIndex = nftVar && nftVar.nftIndex ? nftVar.nftIndex + 1 : 0;
        const contentType = record["Content Type"];
        const nft: INFT = {
          collection: collection._id,
          index: newIndex,
          owner: owner,
          owners: [owner],
          creator: owner,
          artURI: record["Artwork"],
          price: 0,
          name: record["NFT Name"],
          externalLink: record["External Link"],
          description: record["Description"],
          isExplicit: record["Explicit & Sensitive Content"] !== "No",
          explicitContent:
            record["Explicit & Sensitive Content"] === "No" ? "" : record["Explicit & Sensitive Content"],
          saleStatus: SaleStatus.NOTFORSALE,
          mintStatus: MintStatus.LAZYMINTED,
          status_date: new Date().getTime(),
          properties: {},
          lockContent: record["Unlockable Content"] === "No" ? "" : record["Unlockable Content"],
          tokenType: record["Blockchain"] === "ERC721" ? TokenType.ERC721 : TokenType.ERC1155,
          contentType:
            contentType === "music"
              ? ContentType.MUSIC
              : contentType === "image"
              ? ContentType.IMAGE
              : contentType === "video"
              ? ContentType.VIDEO
              : ContentType.IMAGE,
        };
        const result = await nftTable.insertOne(nft);
      }
      return respond({ status: "success", items: records.length });
    } catch (err) {
      return respond(err);
    }
  }

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

  private findNFTItem(collectionId: string, index: number): Object {
    return {
      collection: collectionId,
      index,
    };
  }

  private findNFTItemByArt(art: string): Object {
    return {
      artURI: art,
    };
  }

  private findCollection(contract: string): Object {
    return {
      contract: contract,
    };
  }

  private findCollectionById(id: string): Object {
    return {
      _id: new ObjectId(id),
    };
  }

  private findPerson(address: string): Object {
    return {
      wallet: address,
    };
  }
}
