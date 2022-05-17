import { ObjectId } from "mongodb";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { ActivityType, IActivity } from "../interfaces/IActivity";
import { INFT } from "../interfaces/INFT";
import { INFTCollection, OfferStatusType } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
import { uploadImage, uploadImageBase64 } from "../util/morailsHelper";
import { S3uploadImageBase64 } from "../util/aws-s3-helper";
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
  /**
   * COMBINE SEARCH COLLECTION AND ITEMS
   * @param keyword
   * @returns collection Array and items Array
   */
  async searchCollectionsItems(keyword: string, filters: IQueryFilters): Promise<void | IResponse> {
    try {
      if (this.mongodb) {
        const collectionTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const ownerTable = this.mongodb.collection(this.ownerTable);
        let SK = keyword.split(" ");

        SK.push(keyword);
        let searchKeyword = SK.map(function (e) {
          return new RegExp(e, "igm");
        });
        const result = (await collectionTable
          .find({
            $or: [
              { name: { $in: searchKeyword } },
              { description: { $in: searchKeyword } },
              { category: { $in: searchKeyword } },
              { platform: { $in: searchKeyword } },
              { links: { $in: searchKeyword } },
            ],
          }).sort({volume:-1})
          .toArray()) as Array<INFTCollection>;
        let collections = [];
        if (result) {
          collections = await Promise.all(
            result.map(async (collection) => {
              let floorPrice = 0;
              let owners = [];
              const nfts = (await nftTable.find({ collection: collection._id.toString() }).toArray()) as Array<INFT>;
              nfts.forEach((nft) => {
                if (owners.indexOf(nft.owner) == -1) owners.push(nft.owner);
              });
              const { _24h, todayTrade } = await this.get24HValues(collection._id.toString());
              const creator = (await ownerTable.findOne(this.findPerson(collection.creator))) as IPerson;
              floorPrice = await this.getFloorPrice(`${collection._id}`);
              return {
                _id: collection._id,
                logoUrl: collection.logoUrl,
                featuredUrl: collection.featuredUrl,
                bannerUrl: collection.bannerUrl,
                contract: collection.contract,
                creator: collection.creator,
                creatorDetail: creator,
                url: collection.url,
                description: collection.description,
                category: collection.category,
                links: collection.links,
                name: collection.name,
                blockchain: collection.blockchain,
                volume: collection.volume,
                _24h: todayTrade,
                _24hPercent: _24h,
                floorPrice: floorPrice,
                owners: owners.length,
                items: nfts.length,
                isVerified: collection.isVerified,
                isExplicit: collection.isExplicit,
                properties: collection.properties,
                platform: collection.platform,
                offerStatus: collection.offerStatus,
              };
            })
          );
        }
        // const resultNft = (await nftTable.aggregate(aggregationNft).toArray()) as Array<INFTCollection>;
        const resultNft = (await nftTable
          .find({
            $or: [
              { collection: { $in: searchKeyword } },
              { index: { $in: searchKeyword } },
              { owner: { $in: searchKeyword } },
              { creator: { $in: searchKeyword } },
              { platform: { $in: searchKeyword } },
              { name: { $in: searchKeyword } },
              { description: { $in: searchKeyword } },
              { tokenType: { $in: searchKeyword } },
            ],
          })
          .toArray()) as Array<INFTCollection>;
        let items = [];
        if (resultNft) {
          items = resultNft;
        }
        return respond({
          collections,
          items,
        });
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(error);
      return respond(error.message, true, 500);
    }
  }

  async getCollections(filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const collectionTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const ownerTable = this.mongodb.collection(this.ownerTable);
        let aggregation = {} as any;
        aggregation = this.parseFiltersFind(filters);
        let result = [] as any;
        let count;
        if (aggregation && aggregation.filter) {
          count = await collectionTable.find({ $or: aggregation.filter }).count();
          result = aggregation.sort
            ? ((await collectionTable
                .find({ $or: aggregation.filter })
                .sort(aggregation.sort)
                .toArray()) as Array<INFT>)
            : ((await collectionTable.find({ $or: aggregation.filter }).toArray()) as Array<INFT>);
        } else {
          count = await collectionTable.find().count();
          result = aggregation.sort
            ? await collectionTable.find({}).sort(aggregation.sort).toArray()
            : ((await collectionTable.find({}).toArray()) as Array<INFT>);
        }

        // const result = (await collectionTable.aggregate(aggregation).toArray()) as Array<INFTCollection>;
        if (result) {
          const collections = await Promise.all(
            result.map(async (collection) => {
              // let volume = 0;
              let floorPrice = 0;
              let owners = [];
              const nfts = (await nftTable.find({ collection: `${collection._id}` }).toArray()) as Array<INFT>;
              nfts.forEach((nft) => {
                // volume += nft.price;
                // if (floorPrice > nft.price) floorPrice = nft.price;
                if (owners.indexOf(nft.owner) == -1) owners.push(nft.owner);
              });
              const { _24h, todayTrade } = await this.get24HValues(collection._id.toString());
              const creator = (await ownerTable.findOne(this.findPerson(collection.creator))) as IPerson;
              floorPrice = await this.getFloorPrice(`${collection._id}`);
              return {
                _id: collection._id,
                logoUrl: collection.logoUrl,
                featuredUrl: collection.featuredUrl,
                bannerUrl: collection.bannerUrl,
                contract: collection.contract,
                creator: collection.creator,
                creatorDetail: creator,
                url: collection.url,
                description: collection.description,
                category: collection.category,
                links: collection.links,
                name: collection.name,
                blockchain: collection.blockchain,
                volume: collection.volume,
                _24h: todayTrade,
                _24hPercent: _24h,
                floorPrice: floorPrice,
                owners: owners.length,
                items: nfts.length,
                isVerified: collection.isVerified,
                isExplicit: collection.isExplicit,
                properties: collection.properties,
                platform: collection.platform,
                offerStatus: collection.offerStatus,
              };
            })
          );
          let rst = {
            success: true,
            status: "ok",
            code: 200,
            count: count,
            currentPage: aggregation.page,
            data: collections,
          };

          return rst;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Get collection offers
   * @param filters
   * @returns
   */
  async getCollectionOffer(collectionId: string): Promise<void | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);

        const activityTable = this.mongodb.collection(this.activityTable);
        const history = await activityTable
          .find({
            collection: collectionId,
            nftId: null,
          })
          .toArray();

        const collData = (await nftTable.findOne({ _id: new ObjectId(collectionId) })) as INFTCollection;
        const detailedActivity = await Promise.all(
          history.map(async (activity) => {
            // if (activity.type==ActivityType.OFFERCOLLECTION && activity.nftId){

            activity.collection = collData.contract;
            activity.collectionId = collectionId;
            // else{
            //   const nft = (await nftTable.findOne({ collection: activity.collection, index: activity.nftId })) as INFT;
            //   activity.nftObject = { artUri: nft?.artURI, name: nft?.name };
            //   return activity;
            // }
            return activity;
          })
        );

        return respond(detailedActivity);

        // const collectionTable = this.mongodb.collection(this.table);
        // const nftTable = this.mongodb.collection(this.nftTable);
        // const ownerTable = this.mongodb.collection(this.ownerTable);
        // const actTable = this.mongodb.collection(this.activityTable)
        // const result = await actTable.find({collection: collectionId,nftId:null}).toArray();

        // if (result) {

        //   const collections = await Promise.all(
        //     result.map(async (collection) => {
        //       let floorPrice = 0;
        //       let owners = [];
        //       const nfts = (await actTable.find({ collection: collectionId,offerCollection:collection.offerCollection, nftId:{$ne:null} }).toArray());
        //       const collData = await collectionTable.findOne({_id:ObjectId(collectionId)})

        //       const { _24h, todayTrade } = await this.get24HValues(collData.contract);
        //       floorPrice = await this.getFloorPrice(`${collection._id}`);
        //       const creator = (await ownerTable.findOne(this.findPerson(collData.creator))) as IPerson;

        //       return {
        //         _id: collData._id,
        //         logoUrl: collData.logoUrl,
        //         featuredUrl: collData.featuredUrl,
        //         bannerUrl: collData.bannerUrl,
        //         contract: collData.contract,
        //         creator: collData.creator,
        //         creatorDetail: creator,
        //         url: collData.url,
        //         description: collData.description,
        //         category: collData.category,
        //         links: collData.links,
        //         name: collData.name,
        //         blockchain: collData.blockchain,
        //         volume: collData.volume,
        //         _24h: todayTrade,
        //         _24hPercent: _24h,
        //         floorPrice: floorPrice,

        //         isVerified: collData.isVerified,
        //         isExplicit: collData.isExplicit,
        //         properties: collData.properties,
        //         platform: collData.platform,
        //         offerStatus: collData.offerStatus,
        //         buyer:collection.from,
        //         seller:collection.to,
        //         nfts:nfts
        //       };
        //     })
        //   )
        //   return respond(collections.sort((item1, item2) => item2.volume - item1.volume).slice(0, 10));

        // }
        // return respond("collection not found / not offering yet.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }

  async getHotCollections(filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const collectionTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const ownerTable = this.mongodb.collection(this.ownerTable);
        let aggregation = {} as any;
        aggregation = this.parseFiltersFind(filters);
        let result = [] as any;
        let count;
        if (aggregation && aggregation.filter) {
          count = await collectionTable
            .find({ tagCollection: { $regex: "HOT", $options: "i" }, $or: aggregation.filter })
            .count();
          result = aggregation.sort
            ? ((await collectionTable
                .find({ tagCollection: { $regex: "HOT", $options: "i" }, $or: aggregation.filter })
                .sort(aggregation.sort)
                .toArray()) as Array<INFT>)
            : ((await collectionTable
                .find({ tagCollection: { $regex: "HOT", $options: "i" }, $or: aggregation.filter })
                .toArray()) as Array<INFT>);
        } else {
          count = await collectionTable.find().count();
          result = aggregation.sort
            ? await collectionTable
                .find({ tagCollection: { $regex: "HOT", $options: "i" } })
                .sort(aggregation.sort)
                .toArray()
            : ((await collectionTable
                .find({ tagCollection: { $regex: "HOT", $options: "i" } })
                .toArray()) as Array<INFT>);
        }

        console.log(count);
        // const result = (await collectionTable.aggregate(aggregation).toArray()) as Array<INFTCollection>;
        if (result) {
          const collections = await Promise.all(
            result.map(async (collection) => {
              // let volume = 0;
              let floorPrice = 0;
              let owners = [];
              const nfts = (await nftTable.find({ collection: `${collection._id}` }).toArray()) as Array<INFT>;
              nfts.forEach((nft) => {
                // volume += nft.price;
                // if (floorPrice > nft.price) floorPrice = nft.price;
                if (owners.indexOf(nft.owner) == -1) owners.push(nft.owner);
              });
              const { _24h, todayTrade } = await this.get24HValues(collection._id.toString());
              const creator = (await ownerTable.findOne(this.findPerson(collection.creator))) as IPerson;
              floorPrice = await this.getFloorPrice(`${collection._id}`);
              return {
                _id: collection._id,
                logoUrl: collection.logoUrl,
                featuredUrl: collection.featuredUrl,
                bannerUrl: collection.bannerUrl,
                contract: collection.contract,
                creator: collection.creator,
                creatorDetail: creator,
                url: collection.url,
                description: collection.description,
                category: collection.category,
                links: collection.links,
                name: collection.name,
                blockchain: collection.blockchain,
                volume: collection.volume,
                _24h: todayTrade,
                _24hPercent: _24h,
                floorPrice: floorPrice,
                owners: owners.length,
                items: nfts.length,
                isVerified: collection.isVerified,
                isExplicit: collection.isExplicit,
                properties: collection.properties,
                platform: collection.platform,
                offerStatus: collection.offerStatus,
                tagCollection: collection.tagCollection,
              };
            })
          );
          let rst = {
            success: true,
            status: "ok",
            code: 200,
            count: count,
            currentPage: aggregation.page,
            data: collections,
          };

          return rst;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }

  async getTagCollections(type: string, filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const collectionTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const ownerTable = this.mongodb.collection(this.ownerTable);
        let aggregation = {} as any;
        aggregation = this.parseFiltersFind(filters);
        let result = [] as any;
        let count;
        if (aggregation && aggregation.filter) {
          count = await collectionTable
            .find({ tagCollection: { $regex: type, $options: "i" }, $or: aggregation.filter })
            .count();
          result = aggregation.sort
            ? ((await collectionTable
                .find({ tagCollection: { $regex: type, $options: "i" }, $or: aggregation.filter })
                .sort(aggregation.sort)
                .toArray()) as Array<INFT>)
            : ((await collectionTable
                .find({ tagCollection: { $regex: type, $options: "i" }, $or: aggregation.filter })
                .toArray()) as Array<INFT>);
        } else {
          count = await collectionTable.find().count();
          result = aggregation.sort
            ? await collectionTable
                .find({ tagCollection: { $regex: type, $options: "i" } })
                .sort(aggregation.sort)
                .toArray()
            : ((await collectionTable
                .find({ tagCollection: { $regex: type, $options: "i" } })
                .toArray()) as Array<INFT>);
        }

        
        // const result = (await collectionTable.aggregate(aggregation).toArray()) as Array<INFTCollection>;
        if (result) {
          const collections = await Promise.all(
            result.map(async (collection) => {
              // let volume = 0;
              let floorPrice = 0;
              let owners = [];
              const nfts = (await nftTable.find({ collection: `${collection._id}` }).toArray()) as Array<INFT>;
              nfts.forEach((nft) => {
                // volume += nft.price;
                // if (floorPrice > nft.price) floorPrice = nft.price;
                if (owners.indexOf(nft.owner) == -1) owners.push(nft.owner);
              });
              const { _24h, todayTrade } = await this.get24HValues(collection._id.toString());
              const creator = (await ownerTable.findOne(this.findPerson(collection.creator))) as IPerson;
              floorPrice = await this.getFloorPrice(`${collection._id}`);
              return {
                _id: collection._id,
                logoUrl: collection.logoUrl,
                featuredUrl: collection.featuredUrl,
                bannerUrl: collection.bannerUrl,
                contract: collection.contract,
                creator: collection.creator,
                creatorDetail: creator,
                url: collection.url,
                description: collection.description,
                category: collection.category,
                links: collection.links,
                name: collection.name,
                blockchain: collection.blockchain,
                volume: collection.volume,
                _24h: todayTrade,
                _24hPercent: _24h,
                floorPrice: floorPrice,
                owners: owners.length,
                items: nfts.length,
                isVerified: collection.isVerified,
                isExplicit: collection.isExplicit,
                properties: collection.properties,
                platform: collection.platform,
                offerStatus: collection.offerStatus,
                tagCollection: collection.tagCollection,
              };
            })
          );
          let rst = {
            success: true,
            status: "ok",
            code: 200,
            count: count,
            currentPage: aggregation.page,
            data: collections,
          };

          return rst;
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }

  async getTopCollections(filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const collectionTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const ownerTable = this.mongodb.collection(this.ownerTable);
        let aggregation = {} as any;
        // const result = await collectionTable.find().toArray() as Array<INFTCollection>;
        aggregation = this.parseFiltersFind(filters);
        let result = [] as any;
        let count;
        // const result = (await collectionTable.aggregate(aggregation).toArray()) as Array<INFTCollection>;
        aggregation.sort = { volume: -1 };
        if (aggregation && aggregation.filter) {
          count = await collectionTable.find({ $or: aggregation.filter }).count();
          result = aggregation.sort
            ? ((await collectionTable
                .find({ $or: aggregation.filter })
                .sort(aggregation.sort)
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>)
            : ((await collectionTable
                .find({ $or: aggregation.filter })
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>);
        } else {
          count = await collectionTable.find().count();
          result = aggregation.sort
            ? await collectionTable
                .find({})
                .sort(aggregation.sort)
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()
            : ((await collectionTable
                .find({})
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>);
        }

        if (result) {
          const collections = await Promise.all(
            result.map(async (collection) => {
              let floorPrice = 0;
              let owners = [];
              const nfts = (await nftTable.find({ collection: collection.contract }).toArray()) as Array<INFT>;
              nfts.forEach((nft) => {
                if (owners.indexOf(nft.owner) == -1) owners.push(nft.owner);
              });
              const { _24h, todayTrade } = await this.get24HValues(collection._id.toString());
              const creator = (await ownerTable.findOne(this.findPerson(collection.creator))) as IPerson;
              floorPrice = await this.getFloorPrice(`${collection._id}`);
              return {
                _id: collection._id,
                logoUrl: collection.logoUrl,
                featuredUrl: collection.featuredUrl,
                bannerUrl: collection.bannerUrl,
                contract: collection.contract,
                creator: collection.creator,
                creatorDetail: creator,
                url: collection.url,
                description: collection.description,
                category: collection.category,
                links: collection.links,
                name: collection.name,
                blockchain: collection.blockchain,
                volume: collection.volume,
                _24h: todayTrade,
                _24hPercent: _24h,
                floorPrice: floorPrice,
                owners: owners.length,
                items: nfts.length,
                isVerified: collection.isVerified,
                isExplicit: collection.isExplicit,
                properties: collection.properties,
                platform: collection.platform,
                offerStatus: collection.offerStatus,
              };
            })
          );
          return respond(collections.sort((item1, item2) => item2.volume - item1.volume).slice(0, 10));
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
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
  async getOwners(collectionId: string, filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.nftTable);
        const ownerTable = this.mongodb.collection(this.ownerTable);
        const query = this.findCollectionItem(collectionId);
        const result = (await this.findOne(query)) as INFTCollection;
        if (result) {
          const nfts = await nftTable.find({ collection: collectionId }).toArray();
          let ownerWallets = nfts.map((nft) => nft.owner);
          ownerWallets = ownerWallets.filter((item, pos) => ownerWallets.indexOf(item) == pos);
          let owners = [];
          owners = await Promise.all(
            ownerWallets.map(async (owner) => {
              const ownerDetail = await ownerTable.findOne({ wallet: owner });
              return ownerDetail;
            })
          );
          return respond(owners);
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  };
  /**
   * Get item list in collection
   *
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns {Array<INFT>} item list
   */
  async getItems(collectionId: string, filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        if (!ObjectId.isValid(collectionId)) {
          return respond("Invalid CollectionId", true, 422);
        }
        const nftTable = this.mongodb.collection(this.nftTable);
        const query = this.findCollectionItem(collectionId);
        let aggregation = [] as any;
        const result = await this.findOne(query);
        if (filters) {
          aggregation = this.parseFilters(filters);
        }
        if (!result) {
          return respond("collection items not found.", true, 422);
        }
        // const nfts = await nftTable.aggregate(aggregation).toArray() as Array<INFT>;
        const nfts = (await nftTable.find({ collection: collectionId }).toArray()) as Array<INFT>;
        if (nfts) {
          result.nfts = nfts;
        } else {
          result.nfts = [];
        }
        if (result) {
          return respond(result);
        }
        return respond("collection items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  };
  /**
   * Get all activities (bids and transfer) of NFT items in collection
   *
   * @param collectionId Colleciton id
   * @param filters filter
   * @returns {Array<IActivity>} activity list
   */
  async getActivity(collectionId: string, filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.activityTable);
        const nftTable = this.mongodb.collection(this.nftTable);
        const collTable = this.mongodb.collection(this.table);
        const query = this.findCollectionItem(collectionId);
        let aggregation = {} as any;
        const result = (await this.findOne(query)) as INFTCollection;
        if (result) {
          if (filters) {
            aggregation = this.parseFilters(filters);
            aggregation.push({ $match: { collection: collectionId } });
          }
          const activities = await activityTable.find({ collection: collectionId }).toArray();

          let rstAct = [];
          const detailedActivity = await Promise.all(
            activities.map(async (activity) => {
              if (activity && activity.nftId >= 0) {
                const coll = (await collTable.findOne({ _id: new ObjectId(activity.collection) })) as INFTCollection;

                const nft = (await nftTable.findOne(
                  { collection: activity.collection, index: activity.nftId },
                  { projection: { artURI: 1, _id: 0, name: 1 } }
                )) as INFT;
                activity.nftObject = nft;
                activity.collection={ ...coll };
                return rstAct.push(activity);
              }
              // else{
              //   const nft = (await nftTable.findOne({ collection: activity.collection, index: activity.nftId })) as INFT;
              //   activity.nftObject = { artUri: nft?.artURI, name: nft?.name };
              //   return activity;
              // }
            })
          );
          return respond(rstAct);
        }
        return respond("Activities not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
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
  async getHistory(collectionId: string, filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.activityTable);
        const nftTable = this.mongodb.collection(this.nftTable);
        const query = this.findCollectionItem(collectionId);
        const result = (await this.findOne(query)) as INFTCollection;
        if (result) {
          const history = await activityTable
            // .find({ collection: collectionId, $or: [{ type: "Sold" }, { type: "Transfer" }] })
            .find({ collection: collectionId })
            .toArray();
          const detailedActivity = await Promise.all(
            history.map(async (activity) => {
              // if (activity.type==ActivityType.OFFERCOLLECTION){
              //   const nft = await nftTable.find({ collection: activity.collection},{projection:{'artURI':1,'_id':0,'name':1}}).toArray() as Array<INFT>
              //     activity.nftObject =nft
              //     return activity;
              // }else{
              if (activity && activity.nftId) {
                const nft = (await nftTable.findOne({
                  collection: activity.collection,
                  index: activity.nftId,
                })) as INFT;
                activity.nftObject = { artURI: nft?.artURI, name: nft?.name };
              } else {
                activity.isCollection = true;
              }
              return activity;
              // }
            })
          );
          return respond(detailedActivity);
        }
        return respond("collection not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  /**
   * Create new collection - save to MongoDB
   * It check collection is in database, then fail
   * Otherwise add new collection
   * @param logoFile
   * @param featuredImgFile
   * @param bannerImgFile
   * @param name
   * @param url
   * @param description
   * @param category
   * @param siteUrl
   * @param discordUrl
   * @param instagramUrl
   * @param mediumUrl
   * @param twitterUrl
   * @param telegramUrl
   * @param creatorEarning
   * @param blockchain
   * @param isExplicit
   * @param creatorId
   * @returns result of creation
   */
  async createCollection({
    logoFile,
    featuredImgFile,
    bannerImgFile,
    name,
    url,
    description,
    category,
    siteUrl,
    discordUrl,
    instagramUrl,
    mediumUrl,
    twitterUrl,
    telegramUrl,
    creatorEarning,
    blockchain,
    isExplicit,
    creatorId,
    logoName,
    featureName,
    bannerName,
    logoMimetype,
    featuredMimetype,
    bannerMimetype,
    properties,
  }: any,  loginUser: string): Promise<IResponse> {
    const collection = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.ownerTable);
    try {
      if (!ObjectId.isValid(creatorId)) {
        return respond("Invalid creatorID", true, 422);
      }
      const creator = (await ownerTable.findOne(this.findPersonById(creatorId))) as IPerson;
      if (!creator) {
        return respond("creator address is invalid or missing", true, 422);
      }
  
      if (creator.wallet.toLowerCase() !== loginUser) {
        return respond("Collection owner should be created by the login user", true, 422);
      }	
      if (name == "" || !name) {
        return respond("name is invalid or missing", true, 422);
      }
      if (blockchain == "" || !blockchain) {
        return respond("blockchain is invalid or missing", true, 422);
      }
      if (category == "" || !category) {
        return respond("category is invalid or missing", true, 422);
      }
      const query = this.findCollectionItemByName(name);
      const findResult = (await collection.findOne(query)) as INFTCollection;
      if (findResult && findResult._id) {
        return respond("Same collection name detected", true, 422);
      }
      if (!url) {
        return respond("Collection url empty", true, 422);
      }
      const findUrl = await collection.findOne({ url });
      if (findUrl && findUrl._id) {
        return respond("Same collection url detected", true, 422);
      }
      let contract = "";
      /** Default contract for ERC721 and ERC1155 */
      if (blockchain == "ERC721") contract = "0x8002e428e9F2A19C4f78C625bda69fe70b81Ac26";
      else if (blockchain == "ERC1155") contract = "0x05c54832d62b8250a858B523151984282aC7f8BD";
      const logoIpfs = logoFile? await S3uploadImageBase64(logoFile, `${logoName}_${Date.now()}`, logoMimetype, "collection"): "";
      const featuredIpfs = featuredImgFile? await S3uploadImageBase64(featuredImgFile, `${featureName}_${Date.now()}`, featuredMimetype, "collection"): "";
      const bannerIpfs = bannerImgFile? await S3uploadImageBase64(bannerImgFile, `${bannerName}_${Date.now()}`, bannerMimetype, "collection"): "";
      let initialProperties: any = {};
      // if (isExplicit.toLowerCase() === "true"){
        logoIpfs && logoIpfs['explicit']?isExplicit=true:isExplicit=false;
        featuredIpfs && featuredIpfs['explicit']?isExplicit=true:isExplicit=false;
        bannerIpfs && bannerIpfs['explicit']?isExplicit=true:isExplicit=false;
      // }
      
      if (properties){
        // console.log(properties);
        const propertyNames: any = JSON.parse(properties);

        if (typeof propertyNames === 'object'){
          for (let key in propertyNames) {
            initialProperties[key] = [];
          }
        } else if(Array.isArray(propertyNames)){
          propertyNames.forEach((propertyName) => {
            initialProperties[propertyName] = [];
            });
        }
      };

      const nftCollection: INFTCollection = {
        name: name,
        contract: contract,
        url,
        creator: creator.wallet.toLowerCase(),
        creatorEarning: creatorEarning,
        blockchain: blockchain,
        isVerified: false,
        isExplicit: isExplicit,
        logoUrl:logoIpfs && logoIpfs.location ? logoIpfs['location']:null,
        featuredUrl: featuredIpfs && featuredIpfs.location ? featuredIpfs['location']:null,
        bannerUrl: bannerIpfs && bannerIpfs.location?bannerIpfs['location']:null,
        description: description ?? "",
        category: category ?? "",
        links: [
          siteUrl ?? "",
          discordUrl ?? "",
          instagramUrl ?? "",
          mediumUrl ?? "",
          twitterUrl ?? "",
          telegramUrl ?? "",
        ],
        platform: "ARC",
        properties: initialProperties,
        offerStatus: OfferStatusType.NONE,
      };
      const result = await collection.insertOne(nftCollection);
      if (result) nftCollection._id = result.insertedId;
      return result
        ? respond({ ...nftCollection, creator: creator })
        : respond("Failed to create a new collection.", true, 500);
    } catch (e) {
      console.log(e);
      return respond(e.message, true, 500);
    }
  }

  /**
   * update  collection - save to MongoDB
   * It check collection is in database, then fail
   * Otherwise add new collection
   * @param logoFile
   * @param featuredImgFile
   * @param bannerImgFile
   * @param name
   * @param url
   * @param description
   * @param category
   * @param siteUrl
   * @param discordUrl
   * @param instagramUrl
   * @param mediumUrl
   * @param twitterUrl
   * @param telegramUrl
   * @param creatorEarning
   * @param blockchain
   * @param isExplicit
   * @param creatorId
   * @returns result of creation
   */
  async updateCollection(
    collectionId,
    logoFile,
    featuredImgFile,
    bannerImgFile,
    name,
    url,
    description,
    category,
    siteUrl,
    discordUrl,
    instagramUrl,
    mediumUrl,
    twitterUrl,
    telegramUrl,
    creatorEarning,
    blockchain,
    isExplicit,
    creatorId,
    logoName,
    featureName,
    bannerName,
    properties,
    logoMimetype,
    featuredMimetype,
    bannerMimetype, 
    loginUser: string
  ): Promise<IResponse> {
    const collection = this.mongodb.collection(this.table);
    const ownerTable = this.mongodb.collection(this.ownerTable);
    try {
      

      const findResult = (await collection.findOne({ _id: new ObjectId(collectionId) })) as INFTCollection;


      if (findResult && findResult.creator.toLowerCase() !== loginUser) {
        return respond("Collection owner should be update by the login user", true, 422);
      }

      if (!findResult && findResult._id) {
        return respond("This collection id not found", true, 422);
      }

      let contract = "";
      /** Default contract for ERC721 and ERC1155 */
      if (blockchain == "ERC721") contract = "0x8113901EEd7d41Db3c9D327484be1870605e4144";
      else if (blockchain == "ERC1155") contract = "0xaf8fC965cF9572e5178ae95733b1631440e7f5C8";
      const logoIpfs = logoFile? await S3uploadImageBase64(logoFile, `${logoName}_${Date.now()}`, logoMimetype, "collection"): "";
      const featuredIpfs = featuredImgFile? await S3uploadImageBase64(featuredImgFile, `${featureName}_${Date.now()}`, featuredMimetype, "collection"): "";
      const bannerIpfs = bannerImgFile? await S3uploadImageBase64(bannerImgFile, `${bannerName}_${Date.now()}`, bannerMimetype, "collection"): "";
      logoIpfs && logoIpfs['explicit']?isExplicit=true:isExplicit=false;
      featuredIpfs && featuredIpfs['explicit']?isExplicit=true:isExplicit=false;
      bannerIpfs && bannerIpfs['explicit']?isExplicit=true:isExplicit=false;

      if (logoFile) {
        findResult.logoUrl = logoIpfs['location'];
      }
      if (featuredImgFile) {
        findResult.featuredUrl = featuredIpfs['location'];
      }
      if (bannerImgFile) {
        findResult.bannerUrl = bannerIpfs['location'];
      }
      if (name) {
        findResult.name = name;
      }

      if (url) {
        const findUrl = await collection.findOne({ url });
        if (findUrl && findUrl._id) {
          return respond("Same collection url detected", true, 422);
        }
        findResult.url = url;
      }
      if (creatorEarning) {
        findResult.creatorEarning = creatorEarning;
      }
      if (isExplicit) {
        findResult.isExplicit = isExplicit;  //&& isExplicit.toLowerCase() === "true" ? true : false;
      }
      if (description) {
        findResult.description = description;
      }
      if (category) {
        findResult.category = category;
      }

      findResult.links = [
        siteUrl ?? "",
        discordUrl ?? "",
        instagramUrl ?? "",
        mediumUrl ?? "",
        twitterUrl ?? "",
        telegramUrl ?? "",
      ];
      let initialProperties: any = {};
      if (properties){
        console.log(properties);
        const propertyNames: any = JSON.parse(properties);

        if (typeof propertyNames === 'object'){
          for (let key in propertyNames) {
            initialProperties[key] = [];
          }
        } else if(Array.isArray(propertyNames)){
          propertyNames.forEach((propertyName) => {
            initialProperties[propertyName] = [];
            });
        }
      };

      findResult.properties = initialProperties;
      const result = await collection.replaceOne({ _id: new ObjectId(collectionId) }, findResult);
      return result ? respond({ ...findResult }) : respond("Failed to update a new collection.", true, 500);
    } catch (e) {
      return respond(e.message, true, 500);
    }
  }

  /**
   * Get collection detail information with items, activity
   * @param collectionId collection Id
   * @returns
   */
  async getCollectionDetail(collectionId: string): Promise<IResponse> {
    const collectionTable = this.mongodb.collection(this.table);
    const nftTable = this.mongodb.collection(this.nftTable);
    const activityTable = this.mongodb.collection(this.activityTable);
    const ownerTable = this.mongodb.collection(this.ownerTable);
    const collection = await collectionTable.findOne(this.findCollectionItem(collectionId));
    if (!collection) {
      return respond("collection not found", true, 501);
    }
    // const activities = await activityTable.find({ collection: collectionId }).toArray();
    // collection.activities = activities;
    const nfts = await nftTable.find({ collection: collectionId }).toArray();
    collection.nfts = nfts;
    let owners = nfts.map((nft) => nft.owner);
    owners = owners.filter((item, pos) => owners.indexOf(item) == pos);
    const f = await this.getFloorPrice(`${collection._id}`);
    collection.floorPrice = f;
    collection.owners = owners.length;
    collection.items = nfts.length;
    const { _24h, todayTrade } = await this.get24HValues(collectionId);
    collection._24h = todayTrade;
    collection._24hPercent = _24h;
    const creator = (await ownerTable.findOne(this.findPerson(collection.creator))) as IPerson;
    collection.creatorDetail = creator;
    collection.volume ?? 0;

    const actData = await activityTable
                .find({
                  collection: collectionId,
                  active: true,
                  type: { $in: [ActivityType.OFFERCOLLECTION] },
                })
                .toArray();

    collection.offer_lists=actData;

    return respond(collection);
  }
  /**
   * Get collection detail information with items, activity
   * @param collectionId collection Id
   * @returns
   */
  async getCollectionByUrl(url: string): Promise<IResponse> {
    const collectionTable = this.mongodb.collection(this.table);
    const nftTable = this.mongodb.collection(this.nftTable);
    const activityTable = this.mongodb.collection(this.activityTable);
    const ownerTable = this.mongodb.collection(this.ownerTable);
    const collection = await collectionTable.findOne({ url });
    if (!collection) {
      return respond("collection not found", true, 501);
    }
    const activities = await activityTable.find({ collection: `${collection._id}` }).toArray();
    collection.activities = activities;
    const nfts = await nftTable.find({ collection: `${collection._id}` }).toArray();
    collection.nfts = nfts;
    let owners = nfts.map((nft) => nft.owner);
    owners = owners.filter((item, pos) => owners.indexOf(item) == pos);
    const f = await this.getFloorPrice(`${collection._id}`);
    collection.floorPrice = f;
    collection.owners = owners.length;
    collection.items = nfts.length;
    const { _24h, todayTrade } = await this.get24HValues(`${collection._id}`);
    collection._24h = todayTrade;
    collection._24hPercent = _24h;
    const creator = (await ownerTable.findOne(this.findPerson(collection.creator))) as IPerson;
    collection.creatorDetail = creator;
    return respond(collection);
  }
  /**
   * Delete  collection
   * @param collectionId collection Id
   * @returns
   */
  async deleteCollection(collectionId: string, ownerId: string) {
    const collectionTable = this.mongodb.collection(this.table);
    const nftTable = this.mongodb.collection(this.nftTable);
    try {
      if (!ObjectId.isValid(collectionId)) {
        return respond("Invalid CollectionId", true, 422);
      }      
      const collection = await collectionTable.findOne(this.findCollectionItem(collectionId));
      if (!collection) {
        return respond("Collection Not found", true, 422);
      }
      const nftData = await nftTable.findOne({ collection: collectionId }, { limit: 1 });
      if (nftData) {
        return respond("This collection has Items", true, 422);
      }
      const deleteCollection = await collectionTable.remove(this.findCollectionItem(collectionId));
      return respond(`Collection ${collectionId} has been removed`);
    } catch (e) {
      return respond(e.message, true, 401);
    }
  }
  /**
   * Mounts a generic query to find a collection by contract address.
   * @param contract
   * @returns
   */
  private findCollectionItem(collectionId: string): Object {
    return {
      _id: new ObjectId(collectionId),
    };
  }
  /**
   * Mounts a generic query to find a collection by contract address.
   * @param contract
   * @returns
   */
  private findCollectionItemByName(name: string): Object {
    return {
      name: name,
    };
  }
  /**
   * Mounts a generic query to find a person by wallet address.
   * @param address
   * @returns
   */
  private findPerson(address: string): Object {
    return {
      wallet: address,
    };
  }
  /**
   * Mounts a generic query to find a person by wallet address.
   * @param contract
   * @returns
   */
  private findPersonById(id: string): Object {
    return {
      _id: new ObjectId(id),
    };
  }
   async get24HValues(address: string) {
    const activityTable = this.mongodb.collection(this.activityTable);
    const soldList = (await activityTable
      .find({ collection: address, type: { $in: [ActivityType.TRANSFER, ActivityType.SALE] } })
      .toArray()) as Array<IActivity>;
    let yesterDayTrade = 0;
    let todayTrade = 0;
    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate.getTime());
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const dayBeforeDate = new Date(todayDate.getTime());
    dayBeforeDate.setDate(dayBeforeDate.getDate() - 2);
    soldList.forEach((sold) => {
      if (sold.date > yesterdayDate.getTime() / 1000) {
        // console.log("test", Number(sold.price));
        todayTrade += Number(sold.price) ? sold.price : 0;
      } else if (sold.date > dayBeforeDate.getTime() / 1000) {
        // console.log("yes");
        yesterDayTrade += Number(sold.price) ? sold.price : 0;
      }
    });
    let _24h = 0,
      _24hV = 0;
    _24hV = yesterDayTrade == 0 || !yesterDayTrade ? 0 : (todayTrade / yesterDayTrade) * 100;
    !_24hV ? (_24h = 0) : (_24h = _24hV);

    // if (todayTrade == 0) _24h = 0;
    // else if (yesterDayTrade == 0) _24h = 100;
    // else _24h = (todayTrade / yesterDayTrade) * 100;
    return { _24h, todayTrade };
  }
   async getFloorPrice(collection: string) {
    const actTable = this.mongodb.collection(this.activityTable);
    const fList = (await actTable
      .find({ collection: collection, price: { $ne: null }, active: true, type: "List" })
      .sort({ price: 1 })
      .limit(1)
      .toArray()) as Array<IActivity>;
    if (fList && fList.length > 0) {
      return fList[0].price;
    } else {
      return 0;
    }
  }
}
