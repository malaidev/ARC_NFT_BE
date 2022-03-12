import { IQueryFilters } from "../interfaces/Query";
import { IUser } from "../interfaces/IUser";
import { respond } from "../util/respond";
import { IResponse } from "../interfaces/IResponse";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { IPerson } from "../interfaces/IPerson";
import { INFT } from "../interfaces/INFT";
import { IActivity } from "../interfaces/IActivity";
import { INFTCollection } from "../interfaces/INFTCollection";
export class NFTOwnerController extends AbstractEntity {
  protected data: IPerson;
  protected table = "Person" as string;
  protected nftTable = "NFT" as string;
  protected historyTable = "History" as string;
  protected collectionTable = "NFTCollection" as string;
  constructor(user?: IPerson) {
    super();
    this.data = user;
  }
  /**
   * Gets a set of rows from the database
   * @param {IQueryFilters} filters
   */
  async findAllOwners(
    filters?: IQueryFilters
  ): Promise<Array<IPerson> | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.table);
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
      return respond(error.message, true, 500);
    }
  }
  /**
   * Finds the user which has the given wallet id.
   *
   * @param walletId eth user's main wallet id
   * @returns `IPerson`
   */
  async findPerson(personId: string): Promise<IPerson | IResponse> {
    const query = this.findUserQuery(personId);
    const result = await this.findOne(query);
    if (result) {
      return respond(result, false, 200);
    }
    return respond("Person not found.", true, 422);
  }
  /**
   * 
   * @param backgroundUrl 
   * @param photoUrl 
   * @param wallet 
   * @param joinedDate 
   * @param displayName 
   * @param username
   * @returns new owner created
   */
  async createOwner(backgroundUrl: string, photoUrl: string, wallet: string, joinedDate: Date, displayName: string, username: string): Promise<IPerson | IResponse> {
    const collection = this.mongodb.collection(this.table);
    const findOwner = await collection.findOne(this.findUserQuery(wallet)) as IPerson
    if (findOwner && findOwner._id) {
      return respond("Current user has been created", true, 501)
    }
    let joinDate = joinedDate?new Date(joinedDate):new Date();
    const person: IPerson = {
      // backgroundUrl,
      photoUrl,
      wallet,
      // joinedDate: joinDate,
      // displayName: displayName,
      nfts: [],
      // created: [],
      // favourites: [],
      // history: [],
      username: username,
      collections: []
    }
    const result = await collection.insertOne(person);
    return (result
      ? respond(`Successfully created a new owner with id ${result.insertedId}`, false, 201)
      : respond("Failed to create a new owner.", true, 501));
  }
  /**
   * 
   * @param personId @param 
   * @param bodyData IPerson 
   * @returns 
   */
  async updateOwner(wallet: string, bodyData: any): Promise<IPerson | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.table);
        const result = await collection.updateOne({ wallet }, { $set: { ...bodyData } })
        return respond(result)
      } else {
        throw new Error("Could not connect to the database.");
      }
    }
    catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * 
   * @param ownerId  eq Wallet Id
   * @returns IPerson
   */
  async findOwner(ownerId: string): Promise<IPerson | IResponse> {
    try {
      if (this.mongodb) {
        // const collection = this.mongodb.collection(this.nftTable);
        const result = await this.findPerson(ownerId);
        // if (result && result['code'] == 200) {
        //   const ntfsResult = await collection.find(this.findOwnerNtfs(ownerId)).toArray();
        //   result['data']['nfts'] = ntfsResult;
        // }
        return result;
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * 
   * @param ownerId  eq WalletId
   * @param filters IQueryFilters
   *  OrderBy , direction, filters :[{fieldName:@field,query:@value}]
   *  
   * @returns INFT
   */
  async getOwnerNtfs(ownerId: string, filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.nftTable)
        let aggregation = {} as any;
        const query = this.findOwnerNtfs(ownerId);
        if (filters) {
          aggregation = this.parseFilters(filters);
          aggregation.push({ $match: { ...query }, });
          const items = await collection.aggregate(aggregation).toArray();
          return items as Array<INFT>;
        } else {
          const result = await collection.find(query).toArray();
          return result as Array<INFT>
        }
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * 
   * @param ownerId eq walletId
   * @param filters IQueryFilters
   * @returns IHistory
   */
  async getOwnerHistory(ownerId: string, filters?: IQueryFilters): Promise<Array<IActivity> | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.historyTable)
        let aggregation = {} as any;
        const query = this.findOwnerHistory(ownerId);
        if (filters) {
          aggregation = this.parseFilters(filters);
          aggregation.push({ $match: { ...query }, });
          const items = await collection.aggregate(aggregation).toArray();
          return items as Array<IActivity>;
        } else {
          const result = await collection.find(query).toArray();
          return result as Array<IActivity>
        }
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * 
   * @param ownerId eq walletId
   * @param filters 
   * @returns INFTCollection
   */
  async getOwnerCollection(ownerId: string, filters?: IQueryFilters): Promise<Array<INFTCollection> | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.collectionTable)
        let aggregation = {} as any;
        const query = this.findOwnerCollection(ownerId);
        if (filters.filters.length > 0) {
          aggregation = this.parseFilters(filters);
          aggregation.push({ $match: { ...query }, });
          const items = await collection.aggregate(aggregation).toArray();
          return items as Array<INFTCollection>;
        } else {
          const result = await collection.find(query).toArray();
          return result as Array<INFTCollection>
        }
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * 
   * @param ownerId 
   * @param contract 
   * @param nftId 
   * @returns 
   */
  async insertFavourite(ownerId: String, contract: String,nftId: String) {
    const collTable = this.mongodb.collection(this.collectionTable);
    const nft = this.mongodb.collection(this.nftTable);
    const ownerTable= this.mongodb.collection(this.table);
    const collection = await collTable.findOne(this.findCollectionItem(contract))
    if (!collection) {
      return respond("collection not found", true, 501);
    }
    const queryNft = this.findNFTItem(contract, nftId);
    const nftResult = await nft.findOne(queryNft) as INFT;
    if (!nftResult) {
      return respond("Nft not found", true, 501);
    }
    const owner = await ownerTable.findOne(this.findUserQuery(ownerId)) as IPerson;
    console.log(nftResult);
    if (!owner) {
      return respond("to onwer not found.", true, 422);
    }
    // const index = owner.favourites.indexOf(nftResult,0);
    // const index = await owner.favourites.findIndex(o => o.index === nftResult.index);
    // if (index>=0){
      return respond("This NFT already favourite");
    // }else{
    //   owner.favourites.push(nftResult);
    //   ownerTable.replaceOne({wallet:owner.wallet},owner);
    //   await nft.updateOne({_id:nftResult._id},{$inc:{like:1}});
    //   return respond("Favourite updated");
    // }
  }
  /**
   * 
   * @param ownerId 
   * @param contract 
   * @param nftId   
   * @returns 
   */
  async removeFavourite(ownerId: String, contract: String,nftId: String) {
    const collTable = this.mongodb.collection(this.collectionTable);
    const nft = this.mongodb.collection(this.nftTable);
    const ownerTable= this.mongodb.collection(this.table);
    const collection = await collTable.findOne(this.findCollectionItem(contract))
    if (!collection) {
      return respond("collection not found", true, 501);
    }
    const queryNft = this.findNFTItem(contract, nftId);
    const nftResult = await nft.findOne(queryNft) as INFT;
    if (!nftResult) {
      return respond("Nft not found", true, 501);
    }
    const owner = await ownerTable.findOne(this.findUserQuery(ownerId)) as IPerson;
    if (!owner) {
      return respond("to onwer not found.", true, 422);
    }
    console.log(nftResult);
    // const index = await owner.favourites.findIndex(o => o.index === nftResult.index);
    // console.log(index);
    // if (index>=0){
    //   owner.favourites.splice(index,1);
    //   ownerTable.replaceOne({wallet:owner.wallet},owner);
    //   await nft.updateOne({_id:nftResult._id},{$inc:{like:-1}});
      return respond("Favourite removed");
    // }else{
    //   return respond("Nothing removed ");
    // }
  }
  /**
   * Mounts a generic query to find an user by its ownerId.
   * @param ownerId =walletId
   * @returns 
   */
  private findUserQuery(ownerId: String): Object {
    return {
      wallet: ownerId,
    };
  }
  private findOwnerNtfs(ownerId: String): Object {
    return {
      owner: ownerId
    }
  }
  private findOwnerHistory(ownerId: String): Object {
    return {
      $or: [
        {
          'from.wallet': ownerId
        },
        {
          'to.wallet': ownerId
        }
      ]
    }
  }
  private findOwnerCollection(ownerId: String): Object {
    return {
      'owners.wallet': ownerId
      // $match: {
      //   owners:{
      //     wallet:ownerId
      //   }
      // },
    }
  }
  /**
   * Mounts a generic query to find a collection by contract address.
   * @param contract
   * @returns
   */
   private findCollectionItem(contract: String): Object {
    return {
      contract: contract,
    };
  }
  /**
   * Mounts a generic query to find an item by its collection contract and index.
   * @param contract
   * @returns
   */
   private findNFTItem(contract: String, nftId: String): Object {
    return {
      collection: contract,
      index: nftId
    };
  }
}
