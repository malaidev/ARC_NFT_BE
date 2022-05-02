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
import { INFTReward } from "../interfaces/INFTReward";
import { rewardHelper } from "../util/reward-handler";
export class NFTRewardController extends AbstractEntity {
    protected data: INFTReward;
    protected rewardTable: string = "Reward";
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
        if (rst){
          return  respond({
            wallet:rst.wallet,
            reward:rst.listingReward
          });
        }else{
          
         return respond({
           wallet:wallet,
           reward:0,
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
   
}