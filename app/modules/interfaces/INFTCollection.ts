
export interface INFTCollection {
  _id?: string;
  logoUrl?: string;             // uri of collection logo
  featuredUrl?: string;         // uri of featured logo
  bannerUrl?: string;           // uri of banner logo
  name: string;                 // name of nft collection
  creator: string;              // creator of Collection
  contract: string;             // collection contract address
  url?: string;                 // collection url in arc
  description?: string;         // description of collection
  category?: string;            // category of collection
  links: Array<string>;         // useful links - 0: yoursite, 1: discord, 2: instagram, 3: medium, 4: telegram
  creatorEarning: number;       // Collect a fee when a user re-sells amn item you originally created. This is deducted from the final sale price and paid monthly to your address  
  blockchain: string;           // blockchain
  isVerified: boolean;          // verified flag
  isExplicit: boolean;         // explicit flag
  platform: string;             // platform
  properties: Array<string>;
  offerStatus: OfferStatusType;
  volume?:number
  tagCollection?:string
}

export enum OfferStatusType {
  OFFERED=<any>"OFFERED",
  CANCELED=<any>"CANCELED",
  NONE=<any>"NONE",
}