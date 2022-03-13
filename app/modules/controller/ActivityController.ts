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
 * @param {IActivity} data INFT data
 *
 * @property {data}
 * @property {table}
 * @property {personTable}
 * @property {historyTable}
 * @property {nftCollectionTable}
 * 
 * @method getAllActivites
 *
 * @author Tadashi <tadashi@depo.io>
 * @version 0.0.1
 *
 * ----
 * Example Usage
 *
 * const ctl = new ActivityController();
 *
 * await ctl.getAllActivites()
 *
 */
export class ActivityController extends AbstractEntity {
  protected data: IActivity;
  protected table: string = "Activity";
  protected collectionTable: string = "NFTCollection";
  protected nftTable: string = "NFT";
  protected ownerTable: string = "Person";

  /**
   * Constructor of class
   * @param activity IActivity item data
   */
  constructor(activity?: IActivity) {
    super();
    this.data = activity;
  }

  /**
   * Get all NFTs in collection
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns Array<IActivity>
   */
  async getAllActivites(filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const table = this.mongodb.collection(this.table);
        const result = await table.find().toArray();
        if (result) {
          return respond(result);
        }
        return respond("activity not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::getAllActivites::${this.table}`, error);
      return respond(error.message, true, 500);
    }
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

    const bid : IActivity = {
      collection: contract,
      type: type,
      nftId: "",
      price: 0,
      from: "",
      to: "",
      date: undefined
    };

    // collection.activity.push(bid);
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
