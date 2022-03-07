import { AbstractEntity } from "../abstract/AbstractEntity";
import { IHistory } from "../interfaces/IHistory";
import { INFT, IPrice } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
import { NFTOwnerController } from "./NFTOwnerController";

export class NFTController extends AbstractEntity {
  protected data: INFT;
  protected table = "NFT" as string;
  protected ownerTable = "Owners" as string;

  constructor(nft?: INFT) {
    super();
    this.data = nft;
  }

  async getItemDetail(collection: string, nftId: string): Promise<INFT | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findNFTItem(collection, nftId);
        const result = await this.findOne(query);

        if (result) {
          return result;
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

  async getItemHistory(collection: string, nftId: string): Promise<Array<IHistory> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findNFTItem(collection, nftId);
        const result = await this.findOne(query) as INFT;

        if (result) {
          return result.history;
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

  // async getItems(contract: string, filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
  //   try {
  //     if (this.mongodb) {
  //       const query = this.findNFTItem(contract);
  //       const result = await this.findOne(query);
  //       if (result) {
  //         return result.nfts;
  //       }
  //       return respond("collection not found.", true, 422);
  //     } else {
  //       throw new Error("Could not connect to the database.");
  //     }
  //   } catch (error) {
  //     console.log(`NFTController::getItems::${this.table}`, error);
  //     return respond(error.message, true, 500);
  //   }
  // }


  // async createCollection(contract: string, name: string): Promise<IResponse> {
  //   const collection = this.mongodb.collection(this.table);
  //   const nftCollection : INFTCollection = {
  //     name: name, contract: contract, nfts: [], owners: [], activities: []
  //   }

  //   const query = this.findNFTItem(contract);
  //   const findResult = await collection.findOne(query) as INFTCollection;
  //   if (findResult && findResult._id) {
  //     return respond("Current collection has been created already", true, 501);
  //   }

  //   const result = await collection.insertOne(nftCollection);
  //   return (result
  //           ? respond('Successfully created a new collection with id ${result.insertedId}', true, 201)
  //           : respond("Failed to create a new collection.", true, 501));
    
  // }
  
  /**
   * Mounts a generic query to find an item by its id.
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