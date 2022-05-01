
export interface INFTReward {
    _id?: string;    
    wallet: string;  
    score?: number;  
    reward?:number;
    scoreCollection?:number;
    pnft?:number;
    listingScore?:number;
    listingReward?:number; 
  }
  


export interface INFTRewardDaily {
  _id?: string;    
  wallet: string;  
  date:number,
  score?: number;  
  reward?:number;
  scoreCollection?:number;
  pnft?:number;
  listingScore?:number;
  listingReward?:number; 
}
