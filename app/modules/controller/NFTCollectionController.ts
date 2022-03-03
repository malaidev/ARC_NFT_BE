import { AbstractEntity } from "../abstract/AbstractEntity";
import { IActivity, INFT, IPrice, IPerson } from "../interfaces/INFT";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";

export class NFTController extends AbstractEntity {
  protected data: INFT;
  protected table = "NFTCollection" as string;
  protected nftTable = "NFTCollection" as string;
  protected ownerTable = "Owners" as string;

  constructor(nft?: INFT) {
    super();
    this.data = nft;
  }

  async getOwners(filters?: IQueryFilters): Promise<Array<IPerson> | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.ownerTable);
        let aggregation = {} as any;

        if (filters) {
          aggregation = this.parseFilters(filters);
        }

        const items = await collection.aggregate(aggregation).toArray();
        return items as Array<IPerson>;
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getOwners::${this.ownerTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  async getItems(filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.nftTable);
        let aggregation = {} as any;

        if (filters) {
          aggregation = this.parseFilters(filters);
        }

        const items = await collection.aggregate(aggregation).toArray();
        return items as Array<INFT>;
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getItems::${this.nftTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  async getActivity(nftId: string): Promise<Array<IActivity> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findNFTItem(nftId);
        const result = await this.findOne(query);
        if (result) {
          return result.activites;
        }
        return respond("NFT not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getActivity::${this.nftTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  async getHistory(nftId: string): Promise<Array<IPrice> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findNFTItem(nftId);
        const result = await this.findOne(query);
        if (result) {
          return result.history;
        }
        return respond("NFT not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getHistory::${this.nftTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  


  /**
   * Mounts a generic query to find an item by its id.
   * @param nftId
   * @returns
   */
   private findNFTItem(nftId: string): Object {
    return {
      $elemMatch: {
        id: nftId,
      },
    };
  }
}