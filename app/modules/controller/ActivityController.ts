import { ObjectId } from "mongodb";
import mongoose from "mongoose";
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
        const nftTable = this.mongodb.collection(this.nftTable);

        let aggregation = {} as any;
        
        if (filters) {
          aggregation = this.parseFilters(filters);
        }

        const result = await table.aggregate(aggregation).toArray();

        if (result) {
          const activities = await Promise.all(result.map(async activity => {
            const nft = await nftTable.findOne({collection: activity.collection, index: activity.nftId}) as INFT;
            activity.nftObject = {artUri: nft.artURI, name: nft.name};
            return activity;
          }));
          return respond(activities);
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

  async transfer(contract: string, nftId: string, seller: string, buyer: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);

        const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;

        if (nft) {
          if (nft.owner !== seller) {
            return respond("from wallet isnt nft's owner.", true, 422);
          }

          if (nft.owner == buyer) {
            return respond("destination wallet is nft's owner", true, 422);
          }

          const transfer: IActivity = {
            collection: contract,
            nftId: nftId,
            type: "Transfer",
            date: new Date().getTime(),
            from: seller,
            to: buyer
          }

          nft.status = "Transfer";
          nft.owner = buyer;
          await nftTable.replaceOne(this.findNFTItem(contract, nftId), nft);

          const result = await activityTable.insertOne(transfer);
          return (result
            ? respond('Successfully created a new transfer with id ${result.insertedId}')
            : respond("Failed to create a new activity.", true, 501)); 
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::makeOffer::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  async approveOffer(contract: string, nftId: string, seller: string, buyer: string, activityId: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);

        const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;

        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }

          const offer = await activityTable.findOne({_id: new ObjectId(activityId)}) as IActivity;
          if (!offer ||offer.collection !== contract || offer.nftId !== nftId) {
            return respond("Offer id is invalid", true, 422);
          }

          if (offer.from != seller) {
            return respond("seller isnt offer's seller", true, 422);
          }

          if (offer.to != buyer) {
            return respond("buyer isnt offer's buyer", true, 422);
          }

          const sold: IActivity = {
            collection: contract,
            nftId: nftId,
            type: "Sold",
            price: offer.price,
            date: new Date().getTime(),
            from: seller,
            to: buyer
          }

          nft.status = "Sold";
          nft.owner = buyer;
          await nftTable.replaceOne(this.findNFTItem(contract, nftId), nft);

          const result = await activityTable.insertOne(sold);
          return (result
            ? respond('Successfully created a new sold with id ${result.insertedId}')
            : respond("Failed to create a new activity.", true, 501)); 
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::makeOffer::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  async makeOffer(contract: string, nftId: string, seller: string, buyer: string, price: number, endDate: number) {
    try {
      if (this.mongodb) {

        if (price <= 0) {
          return respond("price cannot be negative or zero", true, 422);
        }

        const startDate = new Date().getTime();
        console.log(startDate, endDate, startDate > endDate);
        if (startDate > endDate) {
          return respond("start date cannot be after enddate", true, 422);
        }

        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);

        const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;

        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }

          const offer: IActivity = {
            collection: contract,
            nftId: nftId,
            type: "Offer",
            price: price,
            startDate: new Date().getTime(),
            endDate: endDate,
            from: seller,
            to: buyer
          }

          const result = await activityTable.insertOne(offer);
          return (result
            ? respond('Successfully created a new makeoffer with id ${result.insertedId}')
            : respond("Failed to create a new activity.", true, 501)); 
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::makeOffer::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  async listForSale(contract: string, nftId: string, seller: string, price: number, endDate: number, fee: number): Promise<IResponse> {
    try {
      if (this.mongodb) {

        if (price <= 0) {
          return respond("price cannot be negative or zero", true, 422);
        }

        const startDate = new Date().getTime();
        console.log(startDate, endDate, startDate > endDate);
        if (startDate > endDate) {
          return respond("start date cannot be after enddate", true, 422);
        }

        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);

        const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;

        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }

          if (nft.status === "For Sale") {
            return respond("Current NFT is already listed for sale.", true, 422);
          }

          nft.status = "For Sale";
          await nftTable.replaceOne(this.findNFTItem(contract, nftId), nft);

          const offer: IActivity = {
            collection: contract,
            nftId: nftId,
            type: "List",
            price: price,
            startDate: new Date().getTime(),
            endDate: endDate,
            from: seller,
            fee: fee
          }

          const result = await activityTable.insertOne(offer);
          return (result
            ? respond('Successfully created a new listforsale with id ${result.insertedId}')
            : respond("Failed to create a new activity.", true, 501)); 
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::listForSale::${this.table}`, error);
      return respond(error.message, true, 500);
    }
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
