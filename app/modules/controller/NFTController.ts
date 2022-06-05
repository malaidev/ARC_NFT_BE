import { ObjectId } from "mongodb";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { ActivityType, IActivity } from "../interfaces/IActivity";
import { ContentType, INFT, MintStatus, SaleStatus, TokenType } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
import { dateDiff } from "../util/datediff-helper";
import { moderationContent, S3uploadImageBase64 } from "../util/aws-s3-helper";
import { IGlobal } from "../interfaces/IGlobal";
import TextHelper from "../util/TextHelper";
import { v4 } from "uuid";
import { INFTBatch } from "../interfaces/INFTBatch";
export class NFTController extends AbstractEntity {
  protected data: INFT;
  protected table: string = "NFT";
  private personTable: string = "Person";
  private activityTable: string = "Activity";
  private nftCollectionTable: string = "NFTCollection";
  private globaltable: string = "Global";
  private nftBatchTable:string="NFTBatch"
  constructor(nft?: INFT) {
    super();
    this.data = nft;
  }
  
  async getItemSimple(tokenType: string, index: number,loginUser?:string): Promise<IResponse> {
    try {
      if (this.mongodb) {
        
        const query = this.findNFTItemByIndex(tokenType, index);        
        const itemTable = this.mongodb.collection(this.table);
        const result = await itemTable.findOne(query);


        if (result) {
          let prop=[];
          if (Array.isArray(result.properties)) {
            for (const property of result.properties) {
              const { title, name } = property;
              prop.push({
                'trait_type':title,
                'value':name
              })
                }
              // }
            }

          const rst:any={
            name:result.name,
            description:result.description,
            image:result.artURI,
            // external_url:result.externalLink,
            attributes:prop
        }
          return rst
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }

  async getItemDetail(collectionId: string, index: number,loginUser?:string): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const query = this.findNFTItem(collectionId, index);
        const acttable = this.mongodb.collection(this.activityTable);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const itemTable = this.mongodb.collection(this.table);
        const result = await itemTable.findOne(query);
        if (result) {
          const personTable = this.mongodb.collection(this.personTable);
          const owner = await personTable.findOne({ wallet: result.owner });
          const collectionData = await collTable.findOne({ _id: new ObjectId(result.collection) });
          const act = await acttable.findOne(
            { collection: result.collection, nftId: result.index, active: true },
            { limit: 1, sort: { startDate: -1 } }
          );
          let timeDiff = "";
          if (act && act.endDate) {
            timeDiff = dateDiff(new Date().getTime(), act.endDate);
          }
          if (!act) {
            const collectionAct = (await acttable.findOne({
              collection: result.collection,
              type: ActivityType.OFFERCOLLECTION,
            })) as IActivity;
            if (collectionAct && collectionAct.endDate)
              timeDiff = dateDiff(new Date().getTime(), collectionAct.endDate);
          }
          result.collectionId = result.collection;
          result.collection = collectionData.contract;
          result.creatorEarning = collectionData.creatorEarning;
          result.timeLeft = timeDiff;
          result.ownerDetail = owner;
          if (result && result.tokenType == "ERC1155") {
            let own = result.owners ?? [];
            let ownD = [];
            if (own.indexOf(owner) == -1) own.push(result.owner);
            ownD.push(result.ownerDetail);
            result.owners = own;
            result.ownersDetail = ownD;
          }
          if (result.owner !== loginUser){
            delete result.lockContent
          };
          return respond(result);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }

  async getItemHistory(collectionId: string, index: number): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const query = this.findNFTItem(collectionId, index);
        const result = (await nftTable.findOne(query)) as INFT;
        if (result) {
          const activityTable = this.mongodb.collection(this.activityTable);
          const history = await activityTable
            .find({
              collection: collectionId,
              nftId: result.index,
              $or: [{ type: { $ne: ActivityType.OFFERCOLLECTION } }, { type: { $ne: ActivityType.CANCELOFFER } }],
            })
            .toArray();
          return respond(history);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async getItemOffers(collectionId: string, index: number): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const activityTable = this.mongodb.collection(this.activityTable);
        const query = this.findNFTItem(collectionId, index);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const result = (await nftTable.findOne(query)) as INFT;
        if (result) {
          let rst = [];
          const offersIndividual = await activityTable
            .find({
              collection: collectionId,
              nftId: result.index,
              $or: [{ type: ActivityType.LIST }, { type: ActivityType.OFFER }, { type: ActivityType.OFFERCOLLECTION }],
              active: true,
            })
            .toArray();
          const resultOffersInvidual = await Promise.all(
            offersIndividual.map(async (item) => {
              if (item && item.nftId) {
                const col = await collTable.findOne({ _id: new ObjectId(item.collection) });
                const nfts = (await nftTable.findOne({ collection: item.collection, index: item.nftId })) as INFT;
                item.collectionId = item.collection;
                item.collection = col.contract;
                item.collectionDetail={
                  creator:col.creator,
                  creatorEarning:col.creatorEarning
                }

                item.nft = { artURI: nfts.artURI, name: nfts.name,ContentType:nfts?.contentType};
                rst.push(item);
              }
              return item;
            })
          );
          // const offersCollection = await activityTable
          //   .find({
          //     collection: collectionId,
          //     type: ActivityType.OFFERCOLLECTION,
          //   })
          //   .toArray();
          // return respond(resultOffersInvidual.concat(offersCollection));
          return respond(rst);
        }
        return respond("nft not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async getItems(filters?: IQueryFilters,loginUser?:string): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const acttable = this.mongodb.collection(this.activityTable);
        let aggregation = {} as any;
        aggregation = this.parseFiltersFind(filters);
        let result = [] as any;
        let count;
        if (!this.checkLimitRequest(aggregation.limit)){
          return respond('Max request limit = 1000',true,401)
        }
        if (aggregation && aggregation.filter) {
          count = await nftTable.find({ $or: aggregation.filter }).count();
          result = aggregation.sort
            ? ((await nftTable
                .find({ $or: aggregation.filter })
                .sort(aggregation.sort)
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>)
            : ((await nftTable
                .find({ $or: aggregation.filter })
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>);
        } else {
          count = await nftTable.find().count();
          result = aggregation.sort
            ? await nftTable.find({}).sort(aggregation.sort).skip(aggregation.skip).limit(aggregation.limit).toArray()
            : ((await nftTable.find({}).skip(aggregation.skip).limit(aggregation.limit).toArray()) as Array<INFT>);
        }
        if (result) {
          const resultsNFT= await this.resultItem(result,loginUser);
          let rst = {
            success: true,
            status: "ok",
            code: 200,
            count: count,
            currentPage: aggregation.page,
            data: resultsNFT,
          };
          return rst;
        }
        return respond("Items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 422);
    }
  }
  async getTagItems(type: string, filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const acttable = this.mongodb.collection(this.activityTable);
        let aggregation = {} as any;
        aggregation = this.parseFiltersFind(filters);
        if (!this.checkLimitRequest(aggregation.limit)){
          return respond('Max request limit = 1000',true,401)
        }
        let result = [] as any;
        let count;
        if (aggregation && aggregation.filter) {
          count = await nftTable.find({ tag: { $regex: type, $options: "i" }, $or: aggregation.filter }).count();
          result = aggregation.sort
            ? ((await nftTable
                .find({ tag: { $regex: type, $options: "i" }, $or: aggregation.filter })
                .sort(aggregation.sort)
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>)
            : ((await nftTable
                .find({ tag: { $regex: type, $options: "i" }, $or: aggregation.filter })
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>);
        } else {
          count = await nftTable.find().count();
          result = aggregation.sort
            ? await nftTable
                .find({ tag: { $regex: type, $options: "i" } })
                .sort(aggregation.sort)
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()
            : ((await nftTable
                .find({ tag: { $regex: type, $options: "i" } })
                .skip(aggregation.skip)
                .limit(aggregation.limit)
                .toArray()) as Array<INFT>);
        }
        //  result = (await nftTable.aggregate(aggregation).toArray()) as Array<INFT>;
        if (result) {
          const resultsNFT = await Promise.all(
            result.map(async (item) => {
              const act = await acttable.findOne(
                {
                  collection: item.collection,
                  nftId: item.index,
                  active: true,
                },
                {
                  limit: 1,
                  sort: {
                    startDate: -1,
                  },
                }
              );
              let timeDiff = "";
              if (act && act.endDate) {
                timeDiff = dateDiff(new Date().getTime(), act.endDate);
              }
              if (!act) {
                const collectionAct = (await acttable.findOne({
                  collection: item.collection,
                  type: ActivityType.OFFERCOLLECTION,
                  active: true,
                })) as IActivity;
                if (collectionAct && collectionAct.endDate)
                  timeDiff = dateDiff(new Date().getTime(), collectionAct.endDate);
              }
              item.timeLeft = timeDiff;
              const collection = (await collTable.findOne({ _id: new ObjectId(item.collection) })) as INFTCollection;
              const actData = await acttable
                .find({
                  collection: item.collection,
                  nftId: item.index,
                  active: true,
                  type: { $in: [ActivityType.OFFER, ActivityType.OFFERCOLLECTION] },
                })
                .toArray();
              return {
                ...item,
                collection_details: {
                  _id: collection?._id,
                  contract: collection?.contract,
                  name: collection?.name,
                  platform: collection?.platform,
                  logoURL: collection?.logoUrl,
                },
                offer_lists: actData,
              };
            })
          );
          let rst = {
            success: true,
            status: "ok",
            code: 200,
            count: count,
            currentPage: aggregation.page,
            data: resultsNFT,
          };
          return rst;
        }
        return respond("Items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 422);
    }
  }
  async getTrendingItems(filters?: IQueryFilters): Promise<Array<INFT> | IResponse> {
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const activityTable = this.mongodb.collection(this.activityTable);
        let aggregation = {} as any;
        if (filters) {
          aggregation = this.parseFilters(filters);
        }
        const result = (await nftTable.aggregate(aggregation).toArray()) as Array<INFT>;
        if (result) {
          const resultsNFT = await Promise.all(
            result.map(async (item) => {
              const collection = (await collTable.findOne({ _id: new ObjectId(item.collection) })) as INFTCollection;
              const activity = (await activityTable
                .find({
                  collection: item.collection,
                  nftId: item.index,
                  type: ActivityType.OFFER,
                  active: true,
                })
                .toArray()) as Array<IActivity>;
              const collectionAct = (await activityTable.findOne({
                collection: item.collection,
                type: ActivityType.OFFERCOLLECTION,
                active: true,
              })) as IActivity;
              activity.push(collectionAct);
              return {
                ...item,
                collection_details: {
                  _id: collection?._id,
                  contract: collection?.contract,
                  name: collection?.name,
                  platform: collection?.platform,
                  logoURL: collection?.logoUrl,
                },
                counts: activity.length,
              };
            })
          );
          return respond(resultsNFT.sort((item1, item2) => item2.counts - item1.counts).slice(0, 10));
        }
        return respond("Items not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }
  async createNFT(
    artFile,
    name,
    externalLink,
    description,
    collectionId,
    properties,
    unlockableContent,
    isExplicit,
    tokenType,
    artName,
    contentType,
    mimeType,
    owner, 
  ): Promise<IResponse> {
    const nftTable = this.mongodb.collection(this.table);
    const collectionTable = this.mongodb.collection(this.nftCollectionTable);
    const ownerTable = this.mongodb.collection(this.personTable);
    const globalTable = this.mongodb.collection(this.globaltable);
    try {
      if (!ObjectId.isValid(collectionId)) {
        return respond("Invalid Collection Id", true, 422);
      }
      let query = this.findCollectionById(collectionId);
      const collection = (await collectionTable.findOne(query)) as INFTCollection;
      if (!collection) {
        return respond("collection not found.", true, 422);
      }
      if (collection.creator!== owner) {
        return respond("collection not the same as login user.", true, 422);
      }
      if (collection && collection.blockchain != tokenType) {
        return respond(`Token Type Should be ${collection.blockchain}`, true, 422);
      }
      if (externalLink && !TextHelper.checkUrl(externalLink)){
        return respond(`${externalLink} is not valid url`, true, 422);
      }
      const artIpfs = artFile ? await S3uploadImageBase64(artFile, `${artName}_${Date.now()}`, mimeType, "item") : "";
      let queryArt = this.findNFTItemByArt(artIpfs['location']);
      artIpfs && artIpfs['explicit']?isExplicit=true:isExplicit=false;
      if (artIpfs && artIpfs.location ){
        const isEx=await moderationContent(artIpfs.key);
        
        isExplicit?isEx:false;
      }
      const findResult = (await nftTable.findOne(queryArt)) as INFT;
      if (findResult && findResult._id) {
        return respond("Current nft has been created already", true, 422);
      }
      // let query = this.findNFTItemByArt(artFile);
      // const findResult = (await nftTable.findOne(query)) as INFT;
      // if (findResult && findResult._id) {
      //   return respond("Current nft has been created already", true, 501);
      // }
      const nftVar = (await globalTable.findOne({ globalId: "nft" }, { limit: 1 })) as IGlobal;
      // const nftVar = await globalTable.findOneAndUpdate({ globalId: "nft" },{$inc:{nftIndex:1}}) as IGlobal;
      let newIndex = nftVar && nftVar.nftIndex ? nftVar.nftIndex + 1 : 0;
      if (nftVar) {
        await globalTable.replaceOne({ globalId: "nft" }, { globalId: "nft", nftIndex: newIndex });
      } else {
        await globalTable.insertOne({
          globalId: "nft",
          nftIndex: newIndex,
        });
      }
      let own = [];
      own.push(owner);
      // const url = await uploadImage(artFile);
      const nft: INFT = {
        collection: collectionId,
        index: newIndex,
        owner: owner,
        owners: own,
        creator: owner,
        artURI: artIpfs['location'],
        price: 0,
        name: name ?? "",
        externalLink: externalLink ?? "",
        description: description ?? "",
        isExplicit: isExplicit ?? false,
        saleStatus: SaleStatus.NOTFORSALE,
        mintStatus: MintStatus.LAZYMINTED,
        status_date: new Date().getTime(),
        properties: properties ? JSON.parse(properties) : {},
        lockContent: unlockableContent ?? false,
        tokenType: tokenType == "ERC721" ? TokenType.ERC721 : TokenType.ERC1155,
        contentType:
          contentType === "music"
            ? ContentType.MUSIC
            : contentType === "image"
            ? ContentType.IMAGE
            : contentType === "video"
            ? ContentType.VIDEO
            : contentType==='audio'
            ? ContentType.AUDIO
            : ContentType.IMAGE,
          fee:collection.creatorEarning??0
            
      };
      const result = await nftTable.insertOne(nft);
      if (result) {
        nft._id = result.insertedId;
        await collectionTable.replaceOne(
          { _id: new ObjectId(collectionId) },
          this._updateCollectionProperties(collection, nft)
        );
      }
      return result ? respond(nft) : respond("Failed to create a new nft.", true, 501);
    } catch (err) {
      console.log(err);
      return respond(err.message, true, 403);
    }
  }

  async batchGet(batchId:string,owner:string): Promise<IResponse> {
    try{
      const nftTable = this.mongodb.collection(this.table);
      const nftBatch = this.mongodb.collection(this.nftBatchTable);
      const result = await nftBatch.findOne({batchId:batchId}) as INFTBatch
      // let forSale=[];
      // let notForSale=[];

      if (result && result.toString()){
        // if (result.owner.toLowerCase()!== owner.toLowerCase()) {
        //   return respond("not the same as login user.", true, 422);
        // };
        return respond(result);
      }
      


      return respond("batch Items not found.", true, 422);



    } catch (error) {
      return respond(error.message, true, 500);
    }

  }
  async batchUpload({
    collectionId,
    tokenType,
    owner,
    records,
  }: {
    collectionId: string;
    tokenType: string;
    owner: string;
    records: any[];
  }) {
    const globalTable = this.mongodb.collection(this.globaltable);
    const collectionTable = this.mongodb.collection(this.nftCollectionTable);
    const ownerTable = this.mongodb.collection(this.personTable);
    const nftTable = this.mongodb.collection(this.table);
    const nftBatch = this.mongodb.collection(this.nftBatchTable)
    try {
      const collData = await collectionTable.findOne({  _id: new ObjectId(collectionId)}) as INFTCollection;
      if (!collData){
        return respond('Collection Id does not exist',true,422);
      }
      if (owner.toLowerCase() !== collData.creator.toLowerCase()) {
        return respond("Collection owner should be created by the login user", true, 422);
      }	
      if (collData && collData.blockchain != tokenType) {
        return respond(`Token Type Should be ${collData.blockchain}`, true, 422);
      };
      const nfts: INFT[] = [];
      const forSale: INFT[] = [];
      const notForSale: INFT[] = [];
      const forSaleBatch=[];
      const notForSaleBatch=[];
      let ntfs_error:INFT[]=[];
      let findIndex;
      const batchId=v4();
      let count = 1;
      await Promise.all(
          records.map(async (record)=>{
            count++;
            if ((record["External Link"] && !TextHelper.checkUrl(record["External Link"])) || (record["Artwork"]&& !TextHelper.checkUrl(record["Artwork"]))){
              findIndex=ntfs_error.findIndex(x=>x['NFT Name']===record['NFT Name']);

              if (findIndex>0){
                 ntfs_error[findIndex]['error_message'].push('invalid link url ')
              }else{
                record['error_message']=['Invalid link url'];
                ntfs_error.push(record);
              }
              findIndex=null;
            };

            if ( record["Artwork"] ===""){
              findIndex=ntfs_error.findIndex(x=>x['Artwork']===record['Artwork']);

              if (findIndex>0){
                 ntfs_error[findIndex]['error_message'].push('Artwork empty')
              }else{
                record['error_message']=['Artwork empty'];
                ntfs_error.push(record);
              }
              findIndex=null;
            }
            
            if (record["List For Sale"] === "Yes" && (record["List Price (ETH)"] =="" || !Number(record["List Price (ETH)"])) ){
              findIndex=ntfs_error.findIndex(x=>x['NFT Name']===record['NFT Name']);
              
               if (findIndex>0){
                 ntfs_error[findIndex]['error_message'].push('invalid price ')
              }else{
                record['error_message']=['Invalid price'];
                ntfs_error.push(record);
              }
              findIndex=null;
            } 
          })
      )
      
      if (count > 1001){
        return respond("Maximum number of items at once is 3,000. Please try again.", true, 422);        
      }
      if (ntfs_error.length>0){
        return {success:false,
          status:'error file upload',
          code :422,
          err_data:ntfs_error
        };
      };
      let nftVar;
      for (let record of records) {
        nftVar = await globalTable.findOneAndUpdate({ globalId: "nft" },{$inc:{nftIndex:1}}) as IGlobal;
          const newIndex = nftVar && nftVar.value && nftVar.value.nftIndex + 1;
          const contentType = record["Content Type"];
          const nft: INFT = {
            collection: collectionId,
            index: newIndex,
            batchId:batchId,
            owner: owner,
            owners: [owner],
            creator: owner,
            artURI: record["Artwork"],
            price: 0,
            name: record["NFT Name"],
            externalLink: record["External Link"],
            description: record["Description"],
            isExplicit: record["Explicit & Sensitive Content"] !== "No",
            explicitContent: "",
            saleStatus: SaleStatus.NOTFORSALE,
            mintStatus: MintStatus.LAZYMINTED,
            status_date: new Date().getTime(),
            properties: record["Properties"].split(",").map((x) => {
              const [title, name] = x
                .trim()
                .split(":")
                .map((y) => y.trim());
              return { title, name };
            }),
            lockContent: record["Unlockable Content"] === "No" ? "" : record["Unlockable Content Details"],
            tokenType: tokenType === "ERC721" ? TokenType.ERC721 : TokenType.ERC1155,
            contentType:
            contentType === "music"
            ? ContentType.MUSIC
            : contentType === "image"
            ? ContentType.IMAGE
            : contentType === "video"
            ? ContentType.VIDEO
            : contentType==='audio'
            ? ContentType.AUDIO
            : ContentType.IMAGE,
            fee:collData.creatorEarning??0,
          successContent:record["Success Modal Content (optional)"]?record["Success Modal Content (optional)"] : "",
          successContentType:record["Success Content Type"] === "music"
          ? record["Success Content Type"].MUSIC
          : record["Success Content Type"] === "image"
          ? ContentType.IMAGE
          : record["Success Content Type"] === "video"
          ? ContentType.VIDEO
          :""
          };
          nfts.push(nft);
          if (record["List For Sale"] === "Yes") {
            forSaleBatch.push({index:newIndex, price: +record["List Price (ETH)"]})
            forSale.push({ ...nft, price: +record["List Price (ETH)"] });
          }else{
            notForSaleBatch.push({index:newIndex, price: +record["List Price (ETH)"]})
            notForSale.push({ ...nft, price: +record["List Price (ETH)"] });
          }  
      }

      if (nfts.length > 0){
        await nftTable.insertMany(nfts);
        let collection = (await collectionTable.findOne({ _id: new ObjectId(collectionId) })) as INFTCollection;
        for (const nft of nfts) {
          collection = this._updateCollectionProperties(collection, nft);
        }
        await collectionTable.replaceOne({ _id: new ObjectId(collectionId) }, collection);

        await nftBatch.insertOne({
          batchId:batchId,
          collection:collectionId,
          owner:owner,
          signature:{r:"",s:"",v:""},
          forSale:forSaleBatch,
          notForSale:notForSaleBatch
        })

      };
      return { status: "success",code:200 , items: records.length, batchId:batchId,  forSale,notForSale,};
    } catch (err) {
      console.log(err);
      return respond(err);
    }
  }
  async deleteItem(id: string, ownerId: string) {
    try {
      if (!ObjectId.isValid(id)) {
        return respond("Invalid itemId ", true, 422);
      }
      const acttable = this.mongodb.collection(this.activityTable);
      const nftTable = this.mongodb.collection(this.table);
      const itemData = await nftTable.findOne({ _id: new ObjectId(id) });
      if (!itemData) {
        return respond("Items not Found", true, 422);
      }
      if (itemData?.owner.toLowerCase() !== ownerId) {
        return respond("this item not belong to this user", true, 422);
      }
      const actData = await acttable.findOne({ nftId: itemData.index });
      if (actData) {
        return respond("This item  has activity", true, 422);
      }
      const deleteItem = await nftTable.remove({ _id: new ObjectId(id) });
      return respond(`Item ${id} has been removed`);
    } catch (e) {
      return respond(e.message, true, 401);
    }
  }
  async updateNFT(id: string, nft: any, ownerId: string) {
    try {
      if (this.mongodb) {
        if (nft.properties && !Array.isArray(nft.properties)) {
          nft.properties = JSON.parse(nft.properties);
        }
        const nftTable = this.mongodb.collection(this.table);
        const itemData = await nftTable.findOne({ _id: new ObjectId(id) });
        if (itemData?.owner.toLowerCase() !== ownerId) {
          return respond("this item not belong to this user", true, 422);
        }
        const result = await nftTable.updateOne({ _id: new ObjectId(id) }, { $set: { ...nft } });
        const collectionTable = this.mongodb.collection(this.nftCollectionTable);
        const collection = (await collectionTable.findOne({ _id: new ObjectId(nft.collection) })) as INFTCollection;
        await collectionTable.replaceOne(
          { _id: new ObjectId(nft.collection) },
          this._updateCollectionProperties(collection, nft)
        );
        return respond(result);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }


  
  async resultItem(result:any,loginUser?:string): Promise<IResponse>{
    try {
      if (this.mongodb) {
        const nftTable = this.mongodb.collection(this.table);
        const collTable = this.mongodb.collection(this.nftCollectionTable);
        const acttable = this.mongodb.collection(this.activityTable);
        let count;
     
        
          const resultsNFT:any = await Promise.all(
            result.map(async (item) => {
              const act = await acttable.findOne(
                {
                  collection: item.collection,
                  nftId: item.index,
                  active: true,
                },
                {
                  limit: 1,
                  sort: {
                    startDate: -1,
                  },
                }
              );
              let timeDiff = "";
              if (act && act.endDate) {
                timeDiff = dateDiff(new Date().getTime(), act.endDate);
              }
              if (!act) {
                const collectionAct = (await acttable.findOne({
                  collection: item.collection,
                  type: ActivityType.OFFERCOLLECTION,
                  active: true,
                })) as IActivity;
                if (collectionAct && collectionAct.endDate)
                  timeDiff = dateDiff(new Date().getTime(), collectionAct.endDate);
              }
              item.timeLeft = timeDiff;
              const collection = (await collTable.findOne({ _id: new ObjectId(item.collection) })) as INFTCollection;
              const actData = await acttable
                .find({
                  collection: item.collection,
                  nftId: item.index,
                  active: true,
                  type: { $in: [ActivityType.OFFER, ActivityType.OFFERCOLLECTION] },
                })
                .toArray();
              if (loginUser!==item.owner){
                item.lockContent="locked content";
              }
              return {
                ...item,
                collection_details: {
                  _id: collection?._id,
                  contract: collection?.contract,
                  name: collection?.name,
                  platform: collection?.platform,
                  logoURL: collection?.logoUrl,
                },
                offer_lists: actData,
              };
            })
          );
          
          return resultsNFT;
        
        
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 422);
    }


  }


  private async getTotalItemAndOwner(collection:string){
    
  }
  private checkLimitRequest(limit:number){
    return limit<=1000?true:false;
  }



  private _updateCollectionProperties(collection: INFTCollection, nft: INFT): INFTCollection {
    const _collection = { ...collection };
    if (Array.isArray(nft.properties)) {
      for (const property of nft.properties) {
        const { title, name } = property;
        if (!Array.isArray(_collection.properties[title])) {
          _collection.properties[title] = [name];
        } else {
          if (!_collection.properties[title].includes(name)) {
            _collection.properties[title].push(name);
          }
        }
      }
    }
    return _collection;
  }
  private findNFTItemByIndex(tokenType: string, index: number): Object {    
    return {
      tokenType:`ERC${tokenType}`,
      index,
    };
  }
  private findNFTItem(collectionId: string, index: number): Object {
    return {
      collection: collectionId,
      index,
    };
  }
  private findNFTItemByArt(art: string): Object {
    return {
      artURI: art,
    };
  }
  private findCollection(contract: string): Object {
    return {
      contract: contract,
    };
  }
  private findCollectionById(id: string): Object {
    return {
      _id: new ObjectId(id),
    };
  }
  private findPerson(address: string): Object {
    return {
      wallet: address,
    };
  }
 
}
