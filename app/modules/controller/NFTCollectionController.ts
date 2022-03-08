import { AbstractEntity } from "../abstract/AbstractEntity";
import { IBid } from "../interfaces/IBid";
import { IHistory } from "../interfaces/IHistory";
import { INFT, IPrice } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";

export class NFTCollectionController extends AbstractEntity {
  protected data: INFTCollection;
  protected table = "NFTCollection" as string;
  protected nftTable = "NFT" as string;
  protected ownerTable = "Person" as string;

  constructor(nft?: INFTCollection) {
    super();
    this.data = nft;
  }

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

  async getActivity(collectionId: string): Promise<Array<IBid> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
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

  async getHistory(collectionId: string): Promise<Array<IPrice> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId) as INFTCollection;
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
  
  async getItemHistory(collectionId: string, nftId: string): Promise<Array<IPrice> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollectionItem(collectionId);
        const result = await this.findOne(query) as INFTCollection;

        if (result) {
          const nft = result.nfts.find(nft => nft._id === nftId);
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

  async createCollection(contract: string, name: string): Promise<IResponse> {
    const collection = this.mongodb.collection(this.table);
    const nftCollection : INFTCollection = {
      name: name, contract: contract, nfts: [], owners: [], history: [], activity: []
    }

    const query = this.findCollectionItem(contract);
    const findResult = await collection.findOne(query) as INFTCollection;
    if (findResult && findResult._id) {
      return respond("Current collection has been created already", true, 501);
    }

    const result = await collection.insertOne(nftCollection);
    return (result
            ? respond('Successfully created a new collection with id ${result.insertedId}', true, 201)
            : respond("Failed to create a new collection.", true, 501));
  }

  async placeBid(contract: string, nftId: string, fromUser: string, price: number, type: string, status: string) {
    const collectionTable = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.ownerTable);
    const nftTable = this.mongodb.collection(this.nftTable);

    const collection = await collectionTable.findOne(this.findCollectionItem(contract)) as INFTCollection;
    if (collection && collection._id) {
      return respond("Current collection has been created already", true, 501);
    }

    const owner = await ownerTable.findOne(this.findPerson(fromUser)) as IPerson;
    if (owner && owner._id) {
      return respond("Current owner has been created already", true, 501);
    }

    const nft = await nftTable.findOne(this.findOne(this.findNFTItem(contract, nftId))) as INFT;
    if (nft && nft._id) {
      return respond("Current nft has been created already", true, 501);
    }

    const bid : IBid = {
      collection: contract,
      bidder: owner,
      bidPrice: price,
      status: status,
      bidOn: nft,
      type: type
    };

    collection.activity.push(bid);
    collectionTable.updateOne({_id:collection._id}, collection);
  }
  
  /**
   * Mounts a generic query to find an item by its id.
   * @param contract
   * @returns
   */
   private findCollectionItem(contract: string): Object {
    return {
      contract: contract,
    };
  }

  private findPerson(address: string): Object {
    return {
      wallet: address,
    };
  }

  private findNFTItem(contract: string, nftId: string): Object {
    return {
      collection: contract,
      index: nftId
    };
  }
}