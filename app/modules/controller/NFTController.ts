import { AbstractEntity } from "../abstract/AbstractEntity";
import { IHistory } from "../interfaces/IHistory";
import { INFT } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";

export class NFTController extends AbstractEntity {
  protected data: INFT;
  protected table = "NFT" as string;
  private personTable: string = "Person";
  historyTable: string = "History";
  nftCollectionTable: string = "NFTCollection";

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

  async getItems(contract: string, filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findCollection(contract);
        const result = await this.findAll(query);
        if (result) {
          return result;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getItems::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  async createNFT(contract: string, nftId: string, artURI: string, price: number, ownerAddr: string, creatorAddr: string): Promise<IResponse> {
    const collection = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.personTable);

    const query = this.findNFTItem(contract, nftId);
    const findResult = await collection.findOne(query) as INFTCollection;
    if (findResult && findResult._id) {
      return respond("Current nft has been created already", true, 501);
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
      owner: owner,
      creator: creator,
      artURI: artURI,
      price: price,
      like: 0,
      priceHistory: [],
      history: [],
      status: "created"
    }

    const result = await collection.insertOne(nft);
    return (result
            ? respond('Successfully created a new nft with id ${result.insertedId}', true, 201)
            : respond("Failed to create a new nft.", true, 501)); 
  }

  async transferNFT(contract: string, nftId: string, from: string, to: string, curDate: Date, price: number) : Promise<IResponse> {
    const collectionTable = this.mongodb.collection(this.nftCollectionTable);
    const nftTable = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.personTable);
    const historyTable = this.mongodb.collection(this.historyTable);

    const collection = await collectionTable.findOne(this.findCollection(contract)) as INFTCollection;
    if (collection && collection._id) {
      return respond("collection not found", true, 501);
    }

    const query = this.findNFTItem(contract, nftId);
    const nft = await nftTable.findOne(query) as INFT;
    if (nft && nft._id) {
      return respond("Current nft has been created already", true, 501);
    }
    
    const fromOwner = await ownerTable.findOne(this.findPerson(from)) as IPerson;
    if (!fromOwner) {
      return respond("from owner not found.", true, 422);
    }

    const toOwner = await ownerTable.findOne(this.findPerson(to)) as IPerson;
    if (!toOwner) {
      return respond("to onwer not found.", true, 422);
    }

    const history :IHistory = {
      collection: contract,
      nftId: nftId,
      type: "transfer",
      price: price,
      from: fromOwner,
      to: toOwner,
      date: curDate,
    };

    collection.history.push(history);
    collectionTable.updateOne({_id:collection._id}, collection);

    const index = fromOwner.nfts.indexOf(nft, 0);
    if (index > -1) {
      fromOwner.nfts.splice(index, 1);
    }
    toOwner.nfts.push(nft);

    fromOwner.history.push(history);
    ownerTable.updateOne({_id: fromOwner._id}, fromOwner);
    toOwner.history.push(history);
    ownerTable.updateOne({_id: toOwner._id}, toOwner);

    const result = await historyTable.insertOne(history);
    return (result
            ? respond('Successfully created a new history with id ${result.insertedId}', true, 201)
            : respond("Failed to create a new history.", true, 501));
  }
  
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

  private findCollection(contract: string): Object {
    return {
      collection: contract,
    };
  }

  private findPerson(address: string): Object {
    return {
      wallet: address,
    };
  }
}
