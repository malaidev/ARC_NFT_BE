import { AbstractEntity } from "../abstract/AbstractEntity";
import { IActivity } from "../interfaces/IActivity";
import { INFT } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
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
   * @param collection Collection Contract Address
   * @param nftId NFT item index
   * @returns INFT object including NFT item information
   */
  async getItemDetail(collection: string, nftId: string): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findNFTItem(collection, nftId);
        const result = await this.findOne(query);
        const collectionTable = this.mongodb.collection(this.nftCollectionTable);

        if (result) {
          const personTable = this.mongodb.collection(this.personTable);
          const owner = await personTable.findOne({wallet: result.owner});
          result.ownerDetail = owner;
          return respond(result);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getItemDetail::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Get NFT item history
   * @param collection Collection Contract Address
   * @param nftId NFT item index in collection
   * @returns Array<IActivity>
   */
  async getItemHistory(collection: string, nftId: string): Promise<IResponse> {

    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const activityTable = this.mongodb.collection(this.activityTable);
        const query = this.findNFTItem(collection, nftId);
        const result = await nftTable.findOne(query) as INFT;
        if (result) {
          const activityTable = this.mongodb.collection(this.activityTable);
          const history = await activityTable.find({collection: collection, $or: [{type: 'Sold'}, {type: 'Transfer'}]}).toArray();

          const detailedActivity = await Promise.all(history.map(async activity => {
            const nft = await this.findOne({collection: activity.collection, index: activity.nftId}) as INFT;
            activity.nftObject = {artUri: nft.artURI, name: nft.name};
            return activity;
          }));
          return respond(detailedActivity);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getItemHistory::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }
  /**
   * Get all NFTs in collection
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns Array<INFT>
   */
  async getItems(filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        // const result = await nftTable.find().toArray();
        let aggregation = {} as any;
        if (filters) {
          aggregation = this.parseFilters(filters);
        }
        const result = await nftTable.aggregate(aggregation).toArray() as Array<INFT>;
        if (result) {
          const resultsNFT= await Promise.all(result.map(async(item)=>{
            const collection=await collTable.findOne({contract:item.collection}) as INFTCollection
            return {
              ...item,
              collection_details:{
                _id:collection._id,
                contract:collection.contract,
                name: collection.name
              }
            }
          }))
          return respond(resultsNFT);
        }
        return respond("Items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getItems::${this.table}`, error);
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
  async createNFT(contract: string, nftId: string, artURI: string, price: number, ownerAddr: string, creatorAddr: string): Promise<IResponse> {
    const nftTable = this.mongodb.collection(this.table);
    const collectionTable = this.mongodb.collection(this.nftCollectionTable);
    const ownerTable = this.mongodb.collection(this.personTable);
    let query = this.findNFTItem(contract, nftId);
    const findResult = await nftTable.findOne(query) as INFT;
    if (findResult && findResult._id) {
      return respond("Current nft has been created already", true, 501);
    }
    query = this.findCollection(contract);
    const collection = await collectionTable.findOne(query) as INFTCollection;
    if (!collection) {
      return respond("collection not found.", true, 422);
    }
    const owner = await ownerTable.findOne(this.findPerson(ownerAddr)) as IPerson;
    if (!owner) {
      return respond("owner not found.", true, 422);
    }
    const creator = await ownerTable.findOne(this.findPerson(creatorAddr)) as IPerson;
    if (!creator) {
      return respond("creator not found.", true, 422);
    }
    const nft : INFT = {
      collection: contract,
      index: nftId,
      owner: owner.wallet,
      creator: creator.wallet,
      artURI: artURI,
      price: price,
      name: "",
      properties: {},
      isLockContent: false,
      isExplicit: false,
      status: 'Minted'
    }

    const result = await nftTable.insertOne(nft);
    return (result
            ? respond(`Successfully created a new nft with id ${result.insertedId}`)
            : respond("Failed to create a new nft.", true, 501)); 
  }
  
  /**
   * Mounts a generic query to find an item by its collection contract and index.
   * @param contract
   * @returns
   */
   private findNFTItem(contract: string, nftId: string): Object {
    return {
      collection: contract,
      index: nftId
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
