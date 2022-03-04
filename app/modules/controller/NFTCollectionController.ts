import { AbstractEntity } from "../abstract/AbstractEntity";
import { IActivity, INFT, IPrice, IPerson, INFTCollection } from "../interfaces/INFT";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
import { NFTOwnerController } from "./NFTOwnerController";

export class NFTCollectionController extends AbstractEntity {
  protected data: INFT;
  protected table = "NFTCollection" as string;
  protected nftTable = "NFTCollection" as string;
  protected ownerTable = "Owners" as string;

  constructor(nft?: INFT) {
    super();
    this.data = nft;
  }

  async getOwners(collectionId: string, filters?: IQueryFilters): Promise<Array<IPerson> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
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

  async getItems(collectionId: string, filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
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

  async getActivity(collectionId: string): Promise<Array<IActivity> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
        const result = await this.findOne(query);
        if (result) {
          return result.nfts;
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

  async getHistory(collectionId: string): Promise<Array<IPrice> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
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
  
  async getItemDetail(collectionId: string, nftId: string): Promise<INFT | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
        const result = await this.findOne(query);

        if (result) {
          const nft = result.nfts.find(nft => nft.id === nftId);
          if (nft) {
            const nftOwner: NFTOwnerController = new NFTOwnerController();
            nft.ownerDetail = await nftOwner.findPerson(nft.owner);
            nft.creatorDetail = await nftOwner.findPerson(nft.creator);
            return nft;
          }
          return respond("nft not found.", true, 422);
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

  async getItemHistory(collectionId: string, nftId: string): Promise<Array<IPrice> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
        const result = await this.findOne(query) as INFTCollection;

        if (result) {
          const nft = result.nfts.find(nft => nft.id === nftId);
          if (nft)
            return nft.priceHistory;
          return respond("nft not found.", true, 422);
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

  async getItemActivity(collectionId: string, nftId: string): Promise<Array<IActivity> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
        const result = await this.findOne(query) as INFTCollection;

        if (result) {
          const nft = result.nfts.find(nft => nft.id === nftId);
          if (nft)
            return nft.activites;
          return respond("nft not found.", true, 422);
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

  async createCollection(collectionId: string, name: string): Promise<IResponse> {
    const collection = this.mongodb.collection(this.table);
    const nftCollection : INFTCollection = {
      id: collectionId, name: name, nfts: [], owners: [], activities: []
    }
    await collection.insertOne(nftCollection);
    return respond('collection cannot create', true, 500);
  }
  
  /**
   * Mounts a generic query to find an item by its id.
   * @param collectionId
   * @returns
   */
   private findCollectionItem(collectionId: string): Object {
    return {
      id: collectionId,
    };
  }
}