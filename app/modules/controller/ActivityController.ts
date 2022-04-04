import { ObjectId } from "mongodb";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { IActivity } from "../interfaces/IActivity";
import { INFT } from "../interfaces/INFT";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
/**
 * This is the Activity controller class.
 * Do all the user's action with nft item
 *
 * @param {IActivity} data INFT data
 *
 * @property {data}
 * @property {table}
 * @property {personTable}
 * @property {historyTable}
 * @property {nftCollectionTable}
 * 
 * 
 * @method getAllActivites
 * @method listForSale
 * @method makeOffer
 * @method approveOffer
 * @method transfer
 * @method cancelOffer
 * @method cancelListForSale
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
            // activity.nftObject = {artUri: nft.artURI, name: nft.name};
            activity.nft = {artUri: nft.artURI, name: nft.name};
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
          const status_date=new Date().getTime();
          const transfer: IActivity = {
            collection: contract,
            nftId: nftId,
            type: "Transfer",
            date: status_date,
            from: seller,
            to: buyer
          }
          nft.status = "Transfer";
          nft.owner = buyer;
          nft.status_date=status_date;
          await nftTable.replaceOne(this.findNFTItem(contract, nftId), nft);
          const result = await activityTable.insertOne(transfer);
          return (result
            ? respond(`Successfully created a new transfer with id ${result.insertedId}`)
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
          const offer = await activityTable.findOne(this.findActivtyWithId(activityId)) as IActivity;
          if (!offer ||offer.collection !== contract || offer.nftId !== nftId) {
            return respond("Offer id is invalid", true, 422);
          }
          if (offer.from != seller) {
            return respond("seller isnt offer's seller", true, 422);
          }
          if (offer.to != buyer) {
            return respond("buyer isnt offer's buyer", true, 422);
          }
          const status_date=new Date().getTime();
          nft.status = "Sold";
          nft.owner = buyer;
          nft.status_date=status_date;
          await nftTable.replaceOne(this.findNFTItem(contract, nftId), nft);
          offer.type = "Sold";
          offer.date = status_date;
          const result = await activityTable.replaceOne(this.findActivtyWithId(activityId), offer);
          return (result                  
            ? respond(`Successfully created a new sold with id ${activityId}`)
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
        if (isNaN(Number(endDate))){return respond("endDate should be unix timestamp", true, 422);}
        if (price <= 0) {
          return respond("price cannot be negative or zero", true, 422);
        }
        const startDate = new Date().getTime();
        // console.log(startDate, endDate, startDate > endDate);
        if (startDate > endDate) {
          return respond("start date cannot be after enddate", true, 422);
        }
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;
        const sortAct = await activityTable.findOne({
        },{
          limit: 1,
          sort: {
            nonce: -1,
          },
        })
        // console.log(sortAct);
        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          let non =sortAct.nonce?sortAct.nonce:0;
          await nftTable.replaceOne(this.findNFTItem(contract, nftId), nft);
          const offer: IActivity = {
            collection: contract,
            nftId: nftId,
            type: "Offer",
            price: price,
            startDate: new Date().getTime(),
            endDate: endDate,
            from: buyer, 
            to: seller,
            nonce:non+1
          }
          const result = await activityTable.insertOne(offer);
          return (result                  
            ? respond(`Successfully created a new offer with id ${result.insertedId}`)
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
  async listForSale(contract: string, nftId: string, seller: string, price: number, endDate: number, fee: number,r:string,s:string,v:string): Promise<IResponse> {
    try {
      if (this.mongodb) {
        if (isNaN(Number(endDate))){return respond("endDate should be unix timestamp", true, 422);}
        if (price <= 0) {
          return respond("price cannot be negative or zero", true, 422);
        }
        const startDate = new Date().getTime();
        // console.log(startDate, endDate, startDate > endDate);
        if (startDate > endDate) {
          return respond("start date cannot be after enddate", true, 422);
        }
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;
        const sortAct = await activityTable.findOne({
        },{
          limit: 1,
          sort: {
            nonce: -1,
          },
        })
        if (nft) {
          if (nft.owner.toLowerCase() !== seller.toLowerCase()) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          if (nft.status === "For Sale") {
            return respond("Current NFT is already listed for sale.", true, 422);
          }
          const status_date=new Date().getTime();
          nft.status = "For Sale";
          nft.status_date=status_date;
          let non =sortAct.nonce?sortAct.nonce:0;
          await nftTable.replaceOne(this.findNFTItem(contract, nftId), nft);
          const offer: IActivity = {
            collection: contract,
            nftId: nftId,
            type: "List",
            price: price,
            startDate: status_date,
            endDate: endDate,
            from: seller,
            fee: fee,
            nonce:non+1,
            signature:{r,s,v}
          }
          const result = await activityTable.insertOne(offer);
          if (result){
            const findData=await activityTable.findOne({ "_id" : new ObjectId(`${result.insertedId}`)});
           return  respond(findData);
          }else{
            return respond("Failed to create a new activity.", true, 501);
          }
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
  async cancelListForSale(contract: string, nftId: string, seller: string, activityId: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;
        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          if (nft.status !== "For Sale") {
            return respond("Current NFT is not listed for sale.", true, 422);
          }
          const cancelList = await activityTable.findOne(this.findActivtyWithId(activityId)) as IActivity;
          if (!cancelList) {
            return respond("activity not found.", true, 422);
          }
          if (cancelList.collection !== contract || cancelList.nftId !== nftId) {
            return respond("Invalid activity Id", true, 422);
          }
          if (cancelList.from !== seller) {
            return respond("seller isnt activity's owner.", true, 422);
          }
          const status_date=new Date().getTime();
          nft.status = "Minted";
          nft.status_date=status_date;

          await nftTable.replaceOne(this.findNFTItem(contract, nftId), nft);
          cancelList.type = "Canceled";
          const result = await activityTable.replaceOne(this.findActivtyWithId(activityId), cancelList);
          return (result
            ? respond('List for sale canceled')
            : respond("Failed to create a new activity.", true, 501)); 
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::cancelListForSale::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }
  async cancelOffer(contract: string, nftId: string, seller: string, buyer: string, activityId: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const nft = await nftTable.findOne(this.findNFTItem(contract, nftId)) as INFT;
        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          const cancelList = await activityTable.findOne(this.findActivtyWithId(activityId)) as IActivity;
          if (!cancelList) {
            return respond("activity not found.", true, 422);
          }
          if (cancelList.collection !== contract || cancelList.nftId !== nftId || cancelList.from != seller || cancelList.to != buyer) {
            return respond("Invalid activity Id", true, 422);
          }
          if (cancelList.from !== seller) {
            return respond("seller isnt activity's owner.", true, 422);
          }
          cancelList.type = "Canceled";
          const result = await activityTable.replaceOne(this.findActivtyWithId(activityId), cancelList);
          return (result
            ? respond('Offer canceled')
            : respond("Failed to create a new activity.", true, 501)); 
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::cancelOffer::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }


  async signOffer(id: string, r:string,s:string,v:string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const actData = await activityTable.findOne(this.findActivtyWithId(id)) as IActivity;
        if (actData) {
          actData.signature={r,s,v}
          const result = await activityTable.replaceOne(this.findActivtyWithId(id), actData);

          return (result
            ? respond('Sing offer update')
            : respond("Failed to update activity.", true, 501)); 
        }
        return respond("activity not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::cancelOffer::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Mounts a generic query to find a collection by contract address.
   * @param contract
   * @returns
   */
   private findActivtyWithId(activtyId: string): Object {
    return {
      _id: new ObjectId(activtyId),
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
