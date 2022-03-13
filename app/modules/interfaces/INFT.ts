import mongoose from "mongoose";
import { IActivity } from "./IActivity";
import { IPerson } from "./IPerson";


export interface INFTSimple {
  collection: string;             // collection contract address
  index: string;                  // index of nft in collection
}

export interface IProperty {
  key: string;
  value: string;
}

export interface INFT extends INFTSimple {
  _id?: string;                   // id of nft
  collection: string;             // collection contract address
  index: string;                  // index of nft in collection
  owner: string;                  // owner
  creator: string;                // creator
  artURI: string;                 // URI of art image
  name: string;                   // nft name
  price: number;
  externalLink?: string;
  description?: string;
  properties: Array<IProperty>;
  isLockContent: boolean;
  lockContent?: string;
  isExplicit: boolean;         // explicit flag
  explicitContent?: string;
}

export interface IPrice {
  price: number;
  timestamp: Date;
}

// const INFTSchema = new mongoose.Schema<INFT>( {
//   collection: String,
//   index: String,
//   owner: String,
//   creator: String,
//   artURI: String,
//   price: Number,
//   like: Number,
//   auctionEnd: Date,
//   protocol: String,
//   priceHistory: [{
//     price: Number,
//     timestamp: Date
//   }],
//   status: String,
//   history: [{
//     ref: 'History',
//     type: mongoose.Schema.Types.ObjectId
//   }]
// })

// export const NFTModel = mongoose.model<INFT>('NFT', INFTSchema);
