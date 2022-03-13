import { AbstractEntity } from "../abstract/AbstractEntity";
import { INFT } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";

/**
 * This is the NFTCollection controller class.
 * Do all the NFTCollection's functions such as
 * get owners, items, activities, histories,
 * and create, placeBid.
 *
 * @param {INFTCollection} data NFTCollection data
 *
 * @property {data}
 * @property {table}
 * @property {nftTable}
 * @property {ownerTable}
 * 
 * @method getOwners
 * @method getItems
 * @method getActivity
 * @method getHistory
 * @method createCollection
 * @method getCollectionDetail
 * @method findCollectionItem
 * @method findPerson
 * 
 *
 * @author Tadashi <tadashi@depo.io>
 * @version 0.0.1
 *
 * ----
 * Example Usage
 *
 * const ctl = new NFTCollectionController();
 *
 * await ctl.getOwners('0xbb6a549b1cf4b2d033df831f72df8d7af4412a82')
 *
 */
export class NFTCollectionController extends AbstractEntity {
  protected data: INFTCollection;
  protected table: string = "NFTCollection";
  protected nftTable: string = "NFT";
  protected ownerTable: string = "Person";
  protected activityTable: string = "Activity";

  /**
   * Constructor of class
   * @param nft NFTCollection data
   */
  constructor(nft?: INFTCollection) {
    super();
    this.data = nft;
  }

  async getCollections(filters?:IQueryFilters): Promise<IResponse> {
    
    try {
      if (this.mongodb) {
        const collectionTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        let aggregation = {} as any;
        // const result = await collectionTable.find().toArray() as Array<INFTCollection>;
        if (filters) {
          aggregation = this.parseFilters(filters);
        }
        const result = await collectionTable.aggregate(aggregation).toArray() as Array<INFTCollection>;

        if (result) {
          const collections = await Promise.all(result.map(async (collection) => {
            let volume = 0;
            let _24h = 0;
            let floorPrice = Number.MAX_VALUE;
            let owners = [];
            const nfts = await nftTable.find({ collection: collection.contract }).toArray() as Array<INFT>;
            nfts.forEach(nft => {
              volume += nft.price;
              if (floorPrice > nft.price)
                floorPrice = nft.price;
              if (owners.indexOf(nft.owner) == -1)
                owners.push(nft.owner);
            });
            return {
              _id:collection._id,
              logoUrl: collection.logoUrl,
              featuredUrl:collection.featuredUrl,
              bannerUrl:collection.bannerUrl,
              contract:collection.contract,
              url:collection.url,
              description:collection.description,
              category:collection.category,
              links:collection.links,
              name: collection.name,
              blockchain: collection.blockchain,
              volume: volume,
              _24h: _24h,
              floorPrice: floorPrice,
              owners: owners.length,
              items: nfts.length,
              isVerified: collection.isVerified,
              isExplicit:collection.isExplicit
            };
          }));

          return respond(collections);
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getCollection::${this.ownerTable}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Get owner list in collection
   * 
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<IPerson>} owner list
   */
  async getOwners(contract: string, filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.nftTable);

        const query = this.findCollectionItem(contract);
        const result = await this.findOne(query) as INFTCollection;
        if (result) {
          const nfts = await nftTable.find({collection: result.contract}).toArray();
          let owners = nfts.map(nft => nft.owner);
          owners = owners.filter((item, pos) => owners.indexOf(item) == pos);
          return respond(owners);
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

  /**
   * Get item list in collection
   * 
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<INFT>} item list
   */
   async getItems(contract: string, filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.nftTable);
        const query = this.findCollectionItem(contract);
        const result = await this.findOne(query);
        if (result) {
          const nfts = await nftTable.find({collection: result.contract}).toArray();
          return respond(nfts);
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

  /**
   * Get all activities (bids and transfer) of NFT items in collection
   * 
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<IActivity>} activity list
   */
   async getActivity(contract: string): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.activityTable);

        const query = this.findCollectionItem(contract);
        const result = await this.findOne(query) as INFTCollection;

        if (result) {
          const activities = await activityTable.find({collection: result.contract}).toArray();
          return respond(activities);
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

  /**
   * Get transfer history of NFT items in collection
   * 
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<IActivity>} history list
   */
   async getHistory(contract: string): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.activityTable);

        const query = this.findCollectionItem(contract);
        const result = await this.findOne(query) as INFTCollection;

        if (result) {
          const history = await activityTable.find({collection: result.contract, type: 'transfer'}).toArray();
          return respond(history);
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTController::getHistory::${this.activityTable}`, error);
      return respond(error.message, true, 500);
    }
  }
  
  /**
   * Create new collection - save to MongoDB 
   * It check collection is in database, then fail
   * Otherwise add new collection
   * 
   * @param contract 
   * @param name 
   * @param logoUrl 
   * @param creatorAddress 
   * @param featuredUrl 
   * @param bannerUrl 
   * @param URL 
   * @param description 
   * @param category 
   * @param linkSite 
   * @param linkDiscord 
   * @param linkInstagram 
   * @param linkMedium 
   * @param linkTelegram 
   * @param creatorEarning 
   * @param blockchain 
   * @param isVerified 
   * @param isExplicit 
   * @param explicitContent 
   * @returns result of creation
   */
  async createCollection(contract: string, name: string, logoUrl: string, creatorAddress: string,
    featuredUrl: string, bannerUrl: string, URL: string, description: string, category: string, 
    linkSite: string, linkDiscord: string, linkInstagram: string, linkMedium: string, linkTelegram: string, 
    creatorEarning: number, blockchain: string, isVerified: boolean, isExplicit: boolean, explicitContent: string
    ): Promise<IResponse> {
    const collection = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.ownerTable);

    try {
      const creator = await ownerTable.findOne(this.findPerson(creatorAddress)) as IPerson;
      if (!creator) {
        throw new Error("creator address is invalid or missing");
      }

      if (contract == '' || !contract) {
        throw new Error("contract address is invalid or missing");
      }

      if (logoUrl == '' || !logoUrl) {
        throw new Error("logoUrl is invalid or missing");
      }

      if (name == '' || !name) {
        throw new Error("logoUrl is invalid or missing");
      }

      if (blockchain == '' || !blockchain) {
        throw new Error("blockchain is invalid or missing");
      }

      if (category == '' || !category) {
        throw new Error("category is invalid or missing");
      }

      const query = this.findCollectionItem(contract);
      const findResult = await collection.findOne(query) as INFTCollection;
      if (findResult && findResult._id) {
        throw new Error("Current collection has been created already");
      }

      const nftCollection : INFTCollection = {
        name: name,
        contract: contract,
        creator: creator.wallet,
        creatorEarning: creatorEarning,
        blockchain: blockchain,
        isVerified: isVerified ?? false,
        isExplicit: isExplicit ?? false,
        logoUrl: logoUrl ?? '',
        featuredUrl: featuredUrl ?? '',
        bannerUrl: bannerUrl ?? '',
        url: URL ?? '',
        description: description ?? '',
        category: category ?? '',
        explicitContent: isExplicit ? explicitContent ?? '' : '',
        links: [linkSite ?? '', linkDiscord ?? '',
         linkInstagram ?? '', linkMedium ?? '', 
         linkTelegram ?? '']
      }

      const result = await collection.insertOne(nftCollection);
      return (result
              ? respond(`Successfully created a new collection with id ${result.insertedId}`)
              : respond("Failed to create a new collection.", true, 500));
    } catch (e) {
      return respond(e.message, true, 500);
    }
  }

  /**
   * Get collection detail information with items, activity
   * @param contract collection address
   * @returns 
   */
  async getCollectionDetail(contract: string): Promise<IResponse> {
    const collectionTable = this.mongodb.collection(this.table);
    const nftTable = this.mongodb.collection(this.nftTable);
    const activityTable = this.mongodb.collection(this.activityTable);

    const collection = await collectionTable.findOne(this.findCollectionItem(contract));
    if (!collection) {
      return respond("collection not found", true, 501);
    }
    const activities = await activityTable.find({collection: contract}).toArray();
    collection.activities = activities;

    const nfts = await nftTable.find({collection: contract}).toArray();
    collection.nfts = nfts;

    let owners = nfts.map(nft => nft.owner);
    owners = owners.filter((item, pos) => owners.indexOf(item) == pos);

    collection.floorPrice = 0;
    collection.totalVolume = 0;
    collection.owners = owners.length;
    collection.items = nfts.length;

    return respond(collection);
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
}
