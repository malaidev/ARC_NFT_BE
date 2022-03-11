import { AbstractEntity } from "../abstract/AbstractEntity";
import { IBid } from "../interfaces/IBid";
import { IHistory } from "../interfaces/IHistory";
import { INFT } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";

/**
 * This is the NFTCollection controller class.
 * Do all the NFTCollection's functions such as
 * get owners, items, activities, histories,
 * and create, placeBid.
 *
 * @param {INFTCollection} data NFTCollection data
 *
 * @property {data}
 * @property {table}
 * @property {nftTable}
 * @property {ownerTable}
 * 
 * @method getOwners
 * @method getItems
 * @method getActivity
 * @method getHistory
 * @method createCollection
 * @method placeBid
 * @method findCollectionItem
 * @method findPerson
 * @method findNFTItem
 * 
 *
 * @author Tadashi <tadashi@depo.io>
 * @version 0.0.1
 *
 * ----
 * Example Usage
 *
 * const ctl = new NFTCollectionController();
 *
 * await ctl.getOwners('0xbb6a549b1cf4b2d033df831f72df8d7af4412a82')
 *
 */
export class NFTCollectionController extends AbstractEntity {
  protected data: INFTCollection;
  protected table: string = "NFTCollection";
  protected nftTable: string = "NFT";
  protected ownerTable: string = "Person";

  /**
   * Constructor of class
   * @param nft NFTCollection data
   */
  constructor(nft?: INFTCollection) {
    super();
    this.data = nft;
  }

  async getCollection(): Promise<Array<INFTCollection> | IResponse> {
    try {
      if (this.mongodb) {
        const collcetionTable = this.mongodb.collection(this.table);

        const result = await collcetionTable.find().toArray();
        if (result) {
          return result;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getCollection::${this.ownerTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Get owner list in collection
   * 
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<IPerson>} owner list
   */
  async getOwners(contract: string, filters?: IQueryFilters): Promise<Array<IPerson> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(contract);
        const result = await this.findOne(query);
        if (result) {
          return result.owners;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getOwners::${this.ownerTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Get item list in collection
   * 
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<INFT>} item list
   */
   async getItems(contract: string, filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(contract);
        const result = await this.findOne(query);
        if (result) {
          return result.nfts;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getItems::${this.nftTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Get all activities (bids and transfer) of NFT items in collection
   * 
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<IBid>} activity list
   */
   async getActivity(contract: string): Promise<Array<IBid> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(contract);
        const result = await this.findOne(query) as INFTCollection;
        if (result) {
          return result.activity;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getActivity::${this.nftTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Get transfer history of NFT items in collection
   * 
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<IHistory>} history list
   */
   async getHistory(contract: string): Promise<Array<IHistory> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(contract) as INFTCollection;
        const result = await this.findOne(query);
        if (result) {
          return result.history;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getHistory::${this.nftTable}`, error);
      return respond(error.message, true, 500);
    }
  }
  
  /**
   * Create new collection - save to MongoDB 
   * It check collection is in database, then fail
   * Otherwise add new collection
   * 
   * @param contract Collection Contract Address
   * @param name Collection Name
   * @returns result of creation
   *      success:  201
   *      fail:     501
   */
  async createCollection(contract: string, name: string, logoUrl: string, creatorAddress: string): Promise<IResponse> {
    const collection = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.ownerTable);

    const creator = await ownerTable.findOne(this.findPerson(creatorAddress)) as IPerson;
    if (!creator) {
      return respond("Cannot find creator", true, 501);
    }

    const nftCollection : INFTCollection = {
      name: name,
      contract: contract,
      nfts: [],
      owners: [],
      history: [],
      activity: [],
      logo: logoUrl,
      creator: creator,
      floorPrice: 0,
      volume: 0,
      latestPrice: 0
    }

    const query = this.findCollectionItem(contract);
    const findResult = await collection.findOne(query) as INFTCollection;
    console.log(findResult);
    if (findResult && findResult._id) {
      return respond("Current collection has been created already", true, 501);
    }

    const result = await collection.insertOne(nftCollection);
    return (result
            ? respond('Successfully created a new collection with id ${result.insertedId}', true, 201)
            : respond("Failed to create a new collection.", true, 501));
  }

  /**
   * Owner place a bid to the NFT item in collection
   * It gets collection, owner, nft from db collections
   * Create new bid and add it to collection activity list and update collection
   * 
   * @param contract Collection Contract Address
   * @param nftId Index of NFT item in collection
   * @param fromUser Bidder wallet address
   * @param price Bid price
   * @param type Bid type
   * @returns result of creation
   *      success:  201
   *      fail:     501
   */
  async placeBid(contract: string, nftId: string, fromUser: string, price: number, type: string) {
    const collectionTable = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.ownerTable);
    const nftTable = this.mongodb.collection(this.nftTable);

    const collection = await collectionTable.findOne(this.findCollectionItem(contract)) as INFTCollection;
    if (!collection) {
      return respond("Current collection has been created already", true, 501);
    }

    const owner = await ownerTable.findOne(this.findPerson(fromUser)) as IPerson;
    if (!owner) {
      return respond("Cannot find owner", true, 501);
    }

    const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;
    if (!nft) {
      return respond("Cannot find nft", true, 501);
    }

    const bid : IBid = {
      collection: contract,
      bidder: owner,
      bidPrice: price,
      status: "Bid",
      bidOn: nft.index,
      type: type
    };

    collection.activity.push(bid);
    collectionTable.replaceOne({contract:collection.contract}, collection);
    return respond("Bid Success");
  }
  
  /**
   * Mounts a generic query to find a collection by contract address.
   * @param contract
   * @returns
   */
   private findCollectionItem(contract: string): Object {
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

  /**
   * Mounts a generic query to find a NFT item by contract address and index.
   * @param contract
   * @returns
   */
   private findNFTItem(contract: string, nftId: string): Object {
    return {
      collection: contract,
      index: nftId
    };
  }
}
