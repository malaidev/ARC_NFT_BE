
import { config } from "../../config/config";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { ActivityType, IActivity } from "../interfaces/IActivity";
import { INFTReward } from "../interfaces/INFTReward";
import { IResponse } from "../interfaces/IResponse";
import { respond } from "./respond";

export class rewardHelper extends AbstractEntity {
    protected data: INFTReward;
    protected rewardTable: string = "Reward";
    protected collectiontable: string = "NFTCollection";
    protected nftTable: string = "NFT";
    protected ownerTable: string = "Person";
    protected activityTable: string = "Activity";
    async calculateReward():Promise<void|IResponse>{
        try {
            if (this.mongodb) {
                const person= this.mongodb.collection(this.ownerTable);
                const colltable=this.mongodb.collection(this.collectiontable);
                const result = await person.find({}).toArray();
                let marketVolume=1;
                const collData= await colltable.aggregate([
                    { $group: { _id : null, sum : { $sum: "$volume" } } }
                ]).toArray();
                console.log(collData);
                collData && collData.length>0?marketVolume= collData[0].sum:marketVolume=1;
                await Promise.all(
                    result.map(async(p)=>{
                        await this.CollectReward(p.wallet.toLowerCase(),marketVolume);
                    })
                )
                return respond('Calculate ok');
            }else{
                throw new Error("Could not connect to the database.");
            }
        } catch (error) {
            console.log(error);
          }
    }
    private async getpnft(wallet:string,scoreCollection:number,totalItems:number){
        let xPnft = 0;
        const act= this.mongodb.collection(this.activityTable);
        const actData = await act.find({from:wallet,type:ActivityType.LIST}).toArray();
        const oneDay = 1000 * 60 * 60 * 24;
        const today = new Date().getTime();

        await Promise.all(
            actData.map(async(p)=>{
                let f= await this.getFloorPrice(p.collection);
                let duration=Math.round(p.endDate-today)/oneDay;
                let pnft=scoreCollection* (1 /(totalItems*(1+p.price-f)*duration) )
                xPnft+=pnft;

            })
        )
        return xPnft;
    };
    private async getListingScore(wallet:string,PNFT:number,multiplier:number){
        let xList=0;
        const act= this.mongodb.collection(this.activityTable);
        const coll = this.mongodb.collection(this.collectiontable);
        const collData = await coll.find({creator:wallet}).toArray();

        await Promise.all(
            collData.map(async(c)=>{
                const fList = (await act
                    .find(
                      { collection: c._id.toString(), type:ActivityType.LIST},
                    
                    ).sort({endDate:-1}).limit(1)
                    .toArray()) as Array<IActivity>;
                    let f= await this.getFloorPrice(c._id.toString());
                let lstPrice = fList && fList.length>0?fList[0].price:0;        
                let lScore = Math.max(lstPrice,f) * PNFT * multiplier;
                xList+=lScore;

            })
        )
        return xList;
        

    }
    private async getFloorPrice(collection: string) {
        const actTable = this.mongodb.collection(this.activityTable);
        const fList = (await actTable
          .find(
            { collection: collection,price:{$ne:null}},
          
          ).sort({price:1}).limit(1)
          .toArray()) as Array<IActivity>;
        if (fList && fList.length > 0) {
          return fList[0].price;
        } else {
          return 0;
        }
      }

    private async CollectReward(wallet:string,marketVolume:number){
        const nft= this.mongodb.collection(this.nftTable);
        const act = this.mongodb.collection(this.activityTable);
        const reward= this.mongodb.collection(this.rewardTable);
        const coll=this.mongodb.collection(this.collectiontable);
        /** Formula
         * 
         *listingReward = listingScoreNFT * Ratearc 
         *listringScoreNFT = max(lastPrice,floorPrice) * Pnft x multiplier
         * Pnft= ScoreCollection/(totalItems*(1+Price-floor)*duration)
         * scoreCollection=(listingArc/totalItems)* (((1+volumeArc)*VolumeOS*salesOs) / totalMarketVolume)
         */
         /**
          * SCORE COLLECTION
          */
          let lastPriceNFT=0;
          let totalMarketVolume=marketVolume||1;
          let floorPriceCollection=0
          let multiplier = 1;
          let listingARC = 1;
          let volumeArc=1;
          let VolumeOS=1;
          let SalesOS = 1;
          let duration=1;
          let price =0;
          let totalItems = 0;
          let rateScoreARC=0.3;
         wallet = wallet.toLowerCase();
         const rstNft= await nft.find().count();
         const rstListing=await act.find({from:wallet}).count();
         const collData= await coll.aggregate([
            {$match:{creator:wallet}},
            { $group: { _id : null, sum : { $sum: "$volume" } } }
        ]).toArray();
         collData && collData.length>0?volumeArc= collData[0].sum:0;
         listingARC=1;
         totalItems=rstNft;
         listingARC=rstListing;

         const openos=await this.getOpenSea();

         VolumeOS=openos.volume;
         SalesOS=openos.sales;
         let SCORECOLLECTION    =   (listingARC/totalItems)*( ( (1+volumeArc)* VolumeOS*SalesOS)/(totalMarketVolume)  );
         let PNFT               =   await this.getpnft(wallet,SCORECOLLECTION,totalItems) //SCORECOLLECTION * (1 /(totalItems*(1+price-floorPriceCollection)*duration) )
         let LISTINGSCORE       =   await this.getListingScore(wallet,PNFT,multiplier)  //Math.max(lastPriceNFT,floorPriceCollection) * PNFT * multiplier;
         let LISTINGREWARD      =   LISTINGSCORE * rateScoreARC;
         
         
        //  console.log('result nft --->>>> ',rstNft);
        //  console.log('result nft listing --->>>> ',rstListing);
        //  console.log('--->>>>>>> SCORE COLLECTION',SCORECOLLECTION);
        //  console.log('--->>>>>>> PNFT ',PNFT);
        //  console.log('--->>>>>>> LISTINGSCORE ',LISTINGSCORE);
        //  console.log('--->>>>>>> LISTINGREWARD ',LISTINGREWARD);

         const insertData={
             wallet,
             scoreCollection:SCORECOLLECTION,
             pnft:PNFT,
             listingScore:LISTINGSCORE,
             listingReward:LISTINGREWARD
         };
         const findReward = await reward.findOne({wallet});
         if (findReward){
             await  reward.updateOne({ wallet }, { $set: insertData });
         }else{
            await reward.insertOne(insertData);
         };
         return;
      }


    private async getOpenSea(){
        const axios = require("axios").default;
        const openSeaUrl=config.opensea.api_addr;
        const openSeaKey=config.opensea.api_key;
        const assetContract = '0x8113901EEd7d41Db3c9D327484be1870605e4144';


        const options = {
            method: 'GET',
            url: `${openSeaUrl}events?only_opensea=false&asset_contract_address=${assetContract}&event_type=successful`,
            headers: {Accept: 'application/json', 'X-API-KEY': `${openSeaKey}`}
        };
        let sales=0;
        let volume=0;
        const result = await axios.request(options);

        if (result && result.length>0){
             sales = result.reduce((acc, obj) => {
                return acc + (+obj.total_price);
              }, 0);
              return {sales,volume};
        }else{
            return {sales,volume};
        }
        // axios.request(options).then(function (response) {
        //     console.log(response.data);


        //   }).catch(function (error) {
        //     throw new Error(`${error}`);
        //   });


      }
}