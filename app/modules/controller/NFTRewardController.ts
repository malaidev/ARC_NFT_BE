import { ObjectId } from "mongodb";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { ActivityType, IActivity } from "../interfaces/IActivity";
import { ContentType, INFT, TokenType } from "../interfaces/INFT";
import { INFTCollection } from "../interfaces/INFTCollection";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
import { uploadImage, uploadImageBase64 } from "../util/morailsHelper";
import { dateDiff } from "../util/datediff-helper";
import { INFTReward, INFTRewardDaily } from "../interfaces/INFTReward";
import { rewardHelper } from "../util/reward-handler";
export class NFTRewardController extends AbstractEntity {
    protected data: INFTReward;
    protected rewardTable: string = "Reward";
    protected rewardDTable: string = "RewardDaily";
    protected collectiontable: string = "NFTCollection";
    protected nftTable: string = "NFT";
    protected ownerTable: string = "Person";
    protected activityTable: string = "Activity";
 /**
   * 
   * @param wallet
   * @returns 
   */
  async getReward(wallet: string): Promise<void | IResponse> {
    try {
      if (this.mongodb) {
        const coll = this.mongodb.collection(this.collectiontable);
        const nft= this.mongodb.collection(this.nftTable);
        const owner = this.mongodb.collection(this.ownerTable);
        const rwd = this.mongodb.collection(this.rewardTable);
        const x = new rewardHelper();

        const rst = await rwd.findOne({wallet});
        console.log(rst);
        if (rst){
          return  respond({
            wallet:rst.wallet,
            listingReward:rst.listingReward+rst.reward,
            collectedToDate:rst.reward,
            collected:rst.claim,
          });
        }else{
          
         return respond({
           wallet:wallet,
           listingReward:0,
           collectedToDate:0,
           collected:0,
           note:`Reward ${wallet} not available yet`
         }) 
        }
        
      }else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(error);
      return respond(error.message, true, 500);
    }
  }

  async getRewardAirDrop(wallet: string): Promise<void | IResponse> {
    try {
      const x = new rewardHelper()
      const y = await x.airDropRewards(wallet)
      console.log(y)
      return respond(y) 

    } catch (error) {
      console.log(error);
      return respond(error.message, true, 500);
    }
  }

   

  async claimReward(wallet: string,claim:number): Promise<void | IResponse> {
    try {
      if (this.mongodb) {
        const coll = this.mongodb.collection(this.collectiontable);
        const nft= this.mongodb.collection(this.nftTable);
        const owner = this.mongodb.collection(this.ownerTable);
        const rwd = this.mongodb.collection(this.rewardTable);
        const rwdD = this.mongodb.collection(this.rewardDTable);
        
        let claimR: number = 0;
        let subReward:number=0;

        typeof  claim== "string" ? (claimR = +claim) : (claimR = claim);
        if (claimR==0){
          return respond('Claim 0',true,403);
        }
        const rst = await rwd.findOne({wallet});
        if (rst){
          // console.log(parseFloat(rst.listingReward));
          // console.log(claimR);
          subReward= rst.listingReward- claimR;
          console.log(subReward);
          if (subReward<=0){
            return respond('Unable to claim ',true,401);
          };
          rst.listingReward=subReward;
          rst.reward+=claimR;
          rst.claim+=claimR;
          // await rwd.replaceOne({wallet},rst);
          // await rwdD.insertOne({
          //   wallet,
          //   type:'CLAIM',
          //   claim:claimR,
          //   date:new Date().getTime()  
            
          // });
          
          return respond(rst);
        }else{
          return respond('Reward Not exists',true,401);
        }

        
      }else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(error);
      return respond(error.message, true, 500);
    }
  }

}