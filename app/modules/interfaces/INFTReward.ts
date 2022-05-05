
export interface INFTReward {
    _id?: string;    
    wallet: string;  
    score?: number;  
    reward?:number;
    scoreCollection?:number;
    pnft?:number;
    listingScore?:number;
    listingReward?:number; 
    claim?:number;
    
    
  }
  


export interface INFTRewardDaily {
  _id?: string;    
  dailyCode:string,
  type:string,
  wallet: string;  
  date:number,
  score?: number;  
  reward?:number;
  scoreCollection?:number;
  pnft?:number;
  listingScore?:number;
  listingReward?:number; 
}
