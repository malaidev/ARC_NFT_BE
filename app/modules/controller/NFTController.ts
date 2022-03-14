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
 * @param {INFT} data INFT data
 *
 * @property {data}
 * @property {table}
 * @property {personTable}
 * @property {historyTable}
 * @property {nftCollectionTable}
 * 
 * @method getItemDetail
 * @method getItemHistory
 * @method getItems
 * @method createNFT
 * @method transferNFT
 * @method findNFTItem
 * @method findCollection
 * @method findPerson
 *
 * @author Tadashi <tadashi@depo.io>
 * @version 0.0.1
 *
 * ----
 * Example Usage
 *
 * const ctl = new NFTController();
 *
 * await ctl.getItemDetail('0xbb6a549b1cf4b2d033df831f72df8d7af4412a82', 3)
 *
 */
export class NFTController extends AbstractEntity {
  protected data: INFT;
  protected table: string = "NFT";
  private personTable: string = "Person";
  private activityTable: string = "Activity";
  private nftCollectionTable: string = "NFTCollection";
  /**
   * Constructor of class
   * @param nft NFT item data
   */
  constructor(nft?: INFT) {
    super();
    this.data = nft;
  }
  /**
   * Get NFT item detail information
   * 
   * @param collection Collection Contract Address
   * @param nftId NFT item index
   * @returns INFT object including NFT item information
   */
  async getItemDetail(collection: string, nftId: string): Promise<INFT | IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findNFTItem(collection, nftId);
        const result = await this.findOne(query);
        const collectionTable = this.mongodb.collection(this.nftCollectionTable);

        if (result) {
          const collection = await collectionTable.findOne({contract:result.collection});

          
          return respond({
            ...result,
            collection
          });
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
  /**
   * Get NFT item history
   * @param collection Collection Contract Address
   * @param nftId NFT item index in collection
   * @returns Array<IActivity>
   */
  async getItemHistory(collection: string, nftId: string): Promise<IResponse> {

    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const activityTable = this.mongodb.collection(this.activityTable);
        const query = this.findNFTItem(collection, nftId);
        const result = await nftTable.findOne(query) as INFT;
        if (result) {
        
          const history = await activityTable.find({collection: result.collection, nftId: result.index, type:'Transfer'}).toArray();
          return respond(history);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getItemHistory::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }
  /**
   * Get all NFTs in collection
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns Array<INFT>
   */
  async getItems(filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        // const result = await nftTable.find().toArray();
        let aggregation = {} as any;
        if (filters) {
          aggregation = this.parseFilters(filters);
        }
        const result = await nftTable.aggregate(aggregation).toArray() as Array<INFT>;
        if (result) {
          return respond(result);
        }
        return respond("Items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getItems::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }
  /**
   * Create NFT item - save to NFT table in db
   * It check collection, owner and creator.
   * After that it create new INFT object and insert it to collection
   * Also it adds this nft to the owner's nft and creator's created
   * Then it adds nft item to the collection
   * 
   * @param contract 
   * @param nftId 
   * @param artURI 
   * @param price 
   * @param ownerAddr 
   * @param creatorAddr 
   * @returns 
   */
  async createNFT(contract: string, nftId: string, artURI: string, price: number, ownerAddr: string, creatorAddr: string): Promise<IResponse> {
    const nftTable = this.mongodb.collection(this.table);
    const collectionTable = this.mongodb.collection(this.nftCollectionTable);
    const ownerTable = this.mongodb.collection(this.personTable);
    let query = this.findNFTItem(contract, nftId);
    const findResult = await nftTable.findOne(query) as INFT;
    if (findResult && findResult._id) {
      return respond("Current nft has been created already", true, 501);
    }
    query = this.findCollection(contract);
    const collection = await collectionTable.findOne(query) as INFTCollection;
    if (!collection) {
      return respond("collection not found.", true, 422);
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
      owner: owner.wallet,
      creator: creator.wallet,
      artURI: artURI,
      price: price,
      name: "",
      properties: [],
      isLockContent: false,
      isExplicit: false
    }
    // collection.nfts.push(nft);
    // const curOwner = collection.owners.find(item => item.wallet === owner.wallet);
    // if (!curOwner)
    //   collection.owners.push(owner);
    // else
    //   curOwner.nfts.push(nft);
    
    // const curCreator = collection.owners.find(item => item.wallet === creator.wallet);
    // if (curCreator) 
    //   curCreator.created.push(nft);

    collectionTable.replaceOne({contract: collection.contract}, collection);
    if (owner.wallet === creator.wallet) {
      owner.nfts.push(nft);
      // owner.created.push(nft);
      ownerTable.replaceOne({wallet: owner.wallet}, owner);
    } else {
      owner.nfts.push(nft);
      ownerTable.replaceOne({wallet: owner.wallet}, owner);
      // creator.created.push(nft);
      ownerTable.replaceOne({wallet: creator.wallet}, creator);
    }
    const result = await nftTable.insertOne(nft);
    return (result
            ? respond('Successfully created a new nft with id ${result.insertedId}')
            : respond("Failed to create a new nft.", true, 501)); 
  }
  /**
   * Transfer NFT item from old owner to new owner
   * At first, it gets collection, old owner, new owner, nft
   * Create new history with data
   * Add created history to the collection, old owner, new owner's history
   * Remove nft from old owner's nfts list and add it to the new owner's nft list
   * Insert new history to the history table
   * 
   * @param contract Collection Contract Address
   * @param nftId NFT item index
   * @param from Old owner wallet address
   * @param to New owner wallet address
   * @param curDate transaction date
   * @param price sell price
   * @returns 
   */
  async transferNFT(contract: string, nftId: string, from: string, to: string, curDate: Date, price: number) : Promise<IResponse> {
    const collectionTable = this.mongodb.collection(this.nftCollectionTable);
    const nftTable = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.personTable);
    const activityTable = this.mongodb.collection(this.activityTable);
    const collection = await collectionTable.findOne(this.findCollection(contract)) as INFTCollection;
    if (!collection) {
      return respond("collection not found", true, 501);
    }
    const query = this.findNFTItem(contract, nftId);
    const nft = await nftTable.findOne(query) as INFT;
    if (!nft) {
      return respond("nft not found", true, 501);
    }
    if (nft.owner !== from) {
      return respond("nft's owner is different from paraemter", true, 422);
    }
    const fromOwner = await ownerTable.findOne(this.findPerson(from)) as IPerson;
    if (!fromOwner) {
      return respond("from owner not found.", true, 422);
    }
    const toOwner = await ownerTable.findOne(this.findPerson(to)) as IPerson;
    if (!toOwner) {
      return respond("to onwer not found.", true, 422);
    }
    if (fromOwner.wallet === toOwner.wallet) {
      return respond("old owner and new owner are same", true, 422);
    }
    const history :IActivity = {
      collection: contract,
      nftId: nftId,
      type: "transfer",
      price: price,
      from: fromOwner.wallet,
      to: toOwner.wallet,
      date: curDate,
    };
    nft.owner = to;
    nftTable.replaceOne({collection: contract, index: nftId}, nft);
    // collection.history.push(history);
    // if (!collection.owners.find(item => item.wallet === toOwner.wallet))
    //   collection.owners.push(toOwner);
    collectionTable.replaceOne({contract:collection.contract}, collection);
    const foundResult = fromOwner.nfts.find(item => item.collection === nft.collection && item.index === nft.index);
    /**Aris Edit */
    // const index = fromOwner.nfts.indexOf(foundResult, 0);
    const index = await fromOwner.nfts.findIndex(o => o.index === foundResult.index);
    if (index >=0) {
      fromOwner.nfts.splice(index, 1);
    }
    // if (index > -1) {
    //   fromOwner.nfts.splice(index, 1);
    // }
    /** */
    toOwner.nfts.push(nft);
    // fromOwner.history.push(history);
    ownerTable.replaceOne({wallet: fromOwner.wallet}, fromOwner);
    // toOwner.history.push(history);
    ownerTable.replaceOne({wallet: toOwner.wallet}, toOwner);
    const result = await activityTable.insertOne(history);
    return (result
            ? respond('Successfully created a new history with id ${result.insertedId}')
            : respond("Failed to create a new history.", true, 501));
  }
  /**
   * Mounts a generic query to find an item by its collection contract and index.
   * @param contract
   * @returns
   */
   private findNFTItem(contract: string, nftId: string): Object {
    return {
      collection: contract,
      index: nftId
    };
  }
  /**
   * Mounts a generic query to find a collection by contract address.
   * @param contract
   * @returns
   */
   private findCollection(contract: string): Object {
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
}
