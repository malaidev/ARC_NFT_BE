import { ObjectId } from "mongodb";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { ActivityType, IActivity } from "../interfaces/IActivity";
import { INFT } from "../interfaces/INFT";
import { INFTCollection, OfferStatusType } from "../interfaces/INFTCollection";
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
          const activities = await Promise.all(
            result.map(async (activity) => {
              const nft = (await nftTable.findOne({
                collection: activity.collection,
                index: activity.nftId,
              })) as INFT;
              // activity.nftObject = {artUri: nft.artURI, name: nft.name};
              activity.nft = { artUri: nft?.artURI, name: nft?.name };
              return activity;
            })
          );
          return respond(activities);
        }
        return respond("activity not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async transfer(collectionId: string, index: number, seller: string, buyer: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const nft = (await nftTable.findOne(this.findNFTItem(collectionId, index))) as INFT;
        if (nft) {
          if (nft.owner !== seller) {
            return respond("from wallet isnt nft's owner.", true, 422);
          }
          if (nft.owner == buyer) {
            return respond("destination wallet is nft's owner", true, 422);
          }
          const status_date = new Date().getTime();
          const transfer: IActivity = {
            collection: collectionId,
            nftId: index,
            type: ActivityType.TRANSFER,
            date: status_date,
            from: seller,
            to: buyer,
          };
          nft.status = "Transfer";
          nft.owner = buyer;
          nft.status_date = status_date;
          await nftTable.replaceOne(this.findNFTItem(collectionId, index), nft);
          const result = await activityTable.insertOne(transfer);
          return result
            ? respond(`Successfully created a new transfer with id ${result.insertedId}`)
            : respond("Failed to create a new activity.", true, 501);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async approveOffer(collectionId: string, index: number, seller: string, buyer: string, activityId: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const nft = (await nftTable.findOne(this.findNFTItem(collectionId, index))) as INFT;
        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          const offer = (await activityTable.findOne(this.findActivtyWithId(activityId))) as IActivity;
          if (!offer || offer.collection !== collectionId || offer.nftId !== index) {
            return respond("Offer id is invalid", true, 422);
          }
          if (offer.from != seller) {
            return respond("seller isnt offer's seller", true, 422);
          }
          if (offer.to != buyer) {
            return respond("buyer isnt offer's buyer", true, 422);
          }
          if (offer.type === ActivityType.OFFERCOLLECTION) {
            const status_date = new Date().getTime();
            nft.status = "Sold";
            nft.owner = buyer;
            nft.status_date = status_date;
            await nftTable.replaceOne(this.findNFTItem(collectionId, index), nft);
            const sold: IActivity = {
              collection: collectionId,
              nftId: index,
              type: ActivityType.SOLD,
              date: status_date,
              from: seller,
              to: buyer,
            };
            const result = await activityTable.insertOne(sold);
            return result
              ? respond(`Successfully created a new transfer with id ${result.insertedId}`)
              : respond("Failed to create a new activity.", true, 501);
          } else if (offer.type === ActivityType.OFFER) {
            const status_date = new Date().getTime();
            nft.status = "Sold";
            nft.owner = buyer;
            nft.status_date = status_date;
            await nftTable.replaceOne(this.findNFTItem(collectionId, index), nft);
            offer.type = ActivityType.SOLD;
            offer.date = status_date;
            const result = await activityTable.replaceOne(this.findActivtyWithId(activityId), offer);
            return result
              ? respond(`Successfully created a new sold with id ${activityId}`)
              : respond("Failed to create a new activity.", true, 501);
          }
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async makeOffer(collectionId: string, index: number, seller: string, buyer: string, price: number, endDate: number) {
    try {
      if (this.mongodb) {

        let prc:number=0;
        typeof price =='string'?prc=+price:prc=price; 
        
        if (isNaN(Number(endDate))) {
          return respond("endDate should be unix timestamp", true, 422);
        }
        if (!Number(price)){
          return respond("Incorrect Price Value", true, 422);
        };
        if (price <= 0) {
          return respond("price cannot be negative or zero", true, 422);
        }

        const startDate = new Date().getTime();
        if (startDate > endDate) {
          return respond("start date cannot be after enddate", true, 422);
        }
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const collTable = this.mongodb.collection(this.collectionTable);
        const nft = (await nftTable.findOne(this.findNFTItem(collectionId, index))) as INFT;
        const sortAct = await activityTable.findOne({}, { limit: 1, sort: { nonce: -1 } });
        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          const nonce = sortAct ? sortAct.nonce + 1 : 0;
          await nftTable.replaceOne(this.findNFTItem(collectionId, index), nft);
          const offer: IActivity = {
            collection: collectionId,
            nftId: index,
            type: ActivityType.OFFER,
            price:prc,
            startDate: new Date().getTime(),
            endDate: endDate,
            from: buyer,
            to: seller,
            nonce,
          };
          const result = await activityTable.insertOne(offer);
          if (result) {
            const findData = await activityTable.findOne({
              _id: new ObjectId(`${result.insertedId}`),
            });
            const collectionData = await collTable.findOne({
              _id: new ObjectId(findData.collection),
            });
            findData.collectionId = findData.collection;
            findData.collection = collectionData.contract;
            return respond({
              ...findData,
            });
          } else {
            respond("Failed to create a new activity.", true, 501);
          }
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async makeCollectionOffer(collectionId: string, seller: string, buyer: string, price: number, endDate: number) {
    try {
      if (this.mongodb) {
        if (isNaN(Number(endDate))) {
          return respond("endDate should be unix timestamp", true, 422);
        }
        if (price <= 0) {
          return respond("price cannot be negative or zero", true, 422);
        }
        const startDate = new Date().getTime();
        if (startDate > endDate) {
          return respond("start date cannot be after enddate", true, 422);
        }
        const activityTable = this.mongodb.collection(this.table);
        const collectionTable = this.mongodb.collection(this.collectionTable);
        const collection = (await collectionTable.findOne(this.findCollectionById(collectionId))) as INFTCollection;
        const sortAct = await activityTable.findOne({}, { limit: 1, sort: { nonce: -1 } });
        if (collection) {
          if (collection.creator !== seller) {
            return respond("seller isnt collection's creator.", true, 422);
          }
          const nonce = sortAct ? sortAct.nonce + 1 : 0;
          collection.offerStatus = OfferStatusType.OFFERED;
          await collectionTable.replaceOne(this.findCollectionById(collectionId), collection);
          const offer: IActivity = {
            collection: collectionId,
            type: ActivityType.OFFERCOLLECTION,
            price: price,
            startDate: new Date().getTime(),
            endDate: endDate,
            from: buyer,
            to: seller,
            nonce,
          };
          const result = await activityTable.insertOne(offer);
          return result
            ? respond(`Successfully created a new offer with id ${result.insertedId}`)
            : respond("Failed to create a new activity.", true, 501);
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async listForSale(
    collectionId: string,
    index: number,
    seller: string,
    price: number,
    endDate: number,
    fee: number
  ): Promise<IResponse> {
    try {
      if (this.mongodb) {
        if (isNaN(Number(endDate))) {
          return respond("endDate should be unix timestamp", true, 422);
        }
        if (price <= 0) {
          return respond("price cannot be negative or zero", true, 422);
        }
        const startDate = new Date().getTime();
        if (startDate > endDate) {
          return respond("start date cannot be after enddate", true, 422);
        }
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const collTable = this.mongodb.collection(this.collectionTable);
        const nft = (await nftTable.findOne(this.findNFTItem(collectionId, index))) as INFT;
        const sortAct = await activityTable.findOne({}, { limit: 1, sort: { nonce: -1 } });
        if (nft) {
          if (nft.owner.toLowerCase() !== seller.toLowerCase()) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          if (nft.status === "For Sale") {
            return respond("Current NFT is already listed for sale.", true, 422);
          }
          const status_date = new Date().getTime();
          nft.status = "For Sale";
          nft.status_date = status_date;
          const nonce = sortAct ? sortAct.nonce + 1 : 0;
          await nftTable.replaceOne(this.findNFTItem(collectionId, index), nft);
          const offer: IActivity = {
            collection: collectionId,
            nftId: index,
            type: ActivityType.LISTFORSALE,
            price: price,
            startDate: status_date,
            endDate: endDate,
            from: seller,
            fee: fee,
            nonce,
            signature: { r: "", s: "", v: "" },
          };
          const result = await activityTable.insertOne(offer);
          if (result) {
            const findData = await activityTable.findOne({
              _id: new ObjectId(`${result.insertedId}`),
            });
            const collectionData = await collTable.findOne({
              _id: new ObjectId(findData.collection),
            });
            findData.collectionId = findData.collection;
            findData.collection = collectionData.contract;
            return respond({
              ...findData,
            });
          } else {
            return respond("Failed to create a new activity.", true, 501);
          }
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async cancelListForSale(collectionId: string, index: number, seller: string, activityId: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const nft = (await nftTable.findOne(this.findNFTItem(collectionId, index))) as INFT;
        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          if (nft.status !== "For Sale") {
            return respond("Current NFT is not listed for sale.", true, 422);
          }
          const cancelList = (await activityTable.findOne(this.findActivtyWithId(activityId))) as IActivity;
          if (!cancelList) {
            return respond("activity not found.", true, 422);
          }
          if (cancelList.collection !== collectionId || cancelList.nftId !== index) {
            return respond("Invalid activity Id", true, 422);
          }
          if (cancelList.from !== seller) {
            return respond("seller isnt activity's owner.", true, 422);
          }
          const status_date = new Date().getTime();
          nft.status = "Minted";
          nft.status_date = status_date;
          await nftTable.replaceOne(this.findNFTItem(collectionId, index), nft);
          cancelList.type = ActivityType.CANCELED;
          const result = await activityTable.replaceOne(this.findActivtyWithId(activityId), cancelList);
          return result ? respond("List for sale canceled") : respond("Failed to create a new activity.", true, 501);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async cancelOffer(collectionId: string, index: number, seller: string, buyer: string, activityId: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const nft = (await nftTable.findOne(this.findNFTItem(collectionId, index))) as INFT;
        if (nft) {
          if (nft.owner !== seller) {
            return respond("seller isnt nft's owner.", true, 422);
          }
          const cancelList = (await activityTable.findOne(this.findActivtyWithId(activityId))) as IActivity;
          if (!cancelList) {
            return respond("activity not found.", true, 422);
          }
          if (
            cancelList.collection !== collectionId ||
            cancelList.nftId !== index ||
            cancelList.from != seller ||
            cancelList.to != buyer
          ) {
            return respond("Invalid activity Id", true, 422);
          }
          if (cancelList.from !== seller) {
            return respond("seller isnt activity's owner.", true, 422);
          }
          cancelList.type = ActivityType.CANCELED;
          const result = await activityTable.replaceOne(this.findActivtyWithId(activityId), cancelList);
          return result ? respond("Offer canceled") : respond("Failed to create a new activity.", true, 501);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async cancelCollectionOffer(collectionId: string, seller: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const collectionTable = this.mongodb.collection(this.collectionTable);
        const collection = (await collectionTable.findOne(this.findCollectionById(collectionId))) as INFTCollection;
        if (collection) {
          if (collection.creator !== seller) {
            return respond("seller isnt nft's creator.", true, 422);
          }
          const cancelList = (await activityTable.findOne(
            this.findActivityWithCollectionId(collectionId)
          )) as IActivity;
          if (!cancelList) {
            return respond("activity not found.", true, 422);
          }
          if (cancelList.from !== seller) {
            return respond("seller isnt activity's owner.", true, 422);
          }
          collection.offerStatus = OfferStatusType.CANCELED;
          await collectionTable.replaceOne(this.findCollectionById(collection._id), collection);
          cancelList.type = ActivityType.CANCELED;
          const result = await activityTable.replaceOne(this.findActivtyWithId(cancelList._id), cancelList);
          return result ? respond("Offer canceled") : respond("Failed to create a new activity.", true, 501);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async signOffer(id: string, r: string, s: string, v: string) {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const actData = (await activityTable.findOne(this.findActivtyWithId(id))) as IActivity;
        if (actData) {
          actData.signature = { r, s, v };
          const result = await activityTable.replaceOne(this.findActivtyWithId(id), actData);
          return result ? respond("Sing offer update") : respond("Failed to update activity.", true, 501);
        }
        return respond("activity not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async deleteActivity(activityId: string) {
    try {
      if (!ObjectId.isValid(activityId)) {
        return respond("Invalid activityId ", true, 422);
      }
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const collTable = this.mongodb.collection(this.collectionTable);

        const activityData = await activityTable.findOne({_id:new ObjectId(activityId)});
        
        if (!activityData){
          return respond('Activity not found',true,422);
        }
        // if (activityData?.type===ActivityType.OFFER || activityData?.type===ActivityType.OFFERCOLLECTION || activityData?.type===ActivityType.SOLD || activityData?.type===ActivityType.TRANSFER ){
        //   return respond('Cannot delete this Activity',true,422);
        // };        
        // const status_date = new Date().getTime();
        // nftData.status = "Created";
        // nftData.status_date = status_date;
        //
        const result = await activityTable.remove({ _id: new ObjectId(activityId) });
        // await nftTable.replaceOne(this.findNFTItem(activityData.collection, activityData.nftId), nftData);
        return result
          ? respond(`Activity with  id ${activityId} has been removed`)
          : respond("Failed to remove  activity.", true, 501);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Mounts a generic query to find a activity by id.
   * @param contract
   * @returns
   */
  private findActivtyWithId(activtyId: string): Object {
    return {
      _id: new ObjectId(activtyId),
    };
  }
  /**
   * Mounts a generic query to find a activity by collection id.
   * @param contract
   * @returns
   */
  private findActivityWithCollectionId(collectionId: string): Object {
    return {
      _id: new ObjectId(collectionId),
      type: ActivityType.OFFERCOLLECTION,
    };
  }
  /**
   * Mounts a generic query to find a activity by collection id.
   * @param contract
   * @returns
   */
  private findActivityWithContract(contract: string): Object {
    return {
      collection: contract,
      type: ActivityType.OFFERCOLLECTION,
    };
  }
  /**
   * Mounts a generic query to find a collection by id.
   * @param contract
   * @returns
   */
  private findCollectionById(collectionId: string): Object {
    return {
      _id: new ObjectId(collectionId),
    };
  }
  /**
   * Mounts a generic query to find a NFT item by contract address and index.
   * @param collectionId
   * @returns
   */
  private findNFTItem(collectionId: string, index: number): Object {
    return {
      collection: collectionId,
      index,
    };
  }
}
