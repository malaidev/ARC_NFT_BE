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
        const collectionTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const ownerTable = this.mongodb.collection(this.ownerTable);


      }else {
        throw new Error("Could not connect to the database.");
      }


    } catch (error) {
      return respond(error.message, true, 500);
    }
  }


  private async CollectReward(wallet:string){


    let lastPriceNFT=0;
    let floorPriceCollection=0
    let volume=0;
    let sales=0;
    let totalMarketVolume=0;
    let multiplier = 1;
    let listingARC = 1;
    let duration=1;
    let price =0;
    let totalItems = 0;



    /** Formula
     * 
     *listingReward = listingScoreNFT * Ratearc 
     *listringScoreNFT = max(lastPrice,floorPrice) * Pnft x multiplier
     * Pnft= ScoreCollection/(totalItems*(1+Price-floor)*duration)
     * scoreCollection=(listingArc/totalItems)* (((1+volumeArc)*VolumeOS*salesOs) / totalMarketVolume)
     */

     

    

  }
}