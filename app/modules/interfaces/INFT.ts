import mongoose from "mongoose";
import { IActivity } from "./IActivity";
import { IPerson } from "./IPerson";


export interface INFTSimple {
  collection: string;             // collection contract address
  index: string;                  // index of nft in collection
}

export interface INFT extends INFTSimple {
  _id?: string;                   // id of nft
  collection: string;             // collection contract address
  index: string;                  // index of nft in collection
  owner: string;                 // owner
  creator: string;               // creator
  artURI: string;                 // URI of art image
  price: number;                  // Current price of nft
  like: number;                   // likes count of nft
  auctionEnd?: Date;              // auction end time
  protocol?: string;              // protocol
  priceHistory: Array<IPrice>;    // price history list of nft
  history: Array<IActivity>;       // history list
  status: string;                 // status of current nft
}

export interface IPrice {
  price: number;
  timestamp: Date;
}

const INFTSchema = new mongoose.Schema<INFT>( {
  collection: String,
  index: String,
  owner: String,
  creator: String,
  artURI: String,
  price: Number,
  like: Number,
  auctionEnd: Date,
  protocol: String,
  priceHistory: [{
    price: Number,
    timestamp: Date
  }],
  status: String,
  history: [{
    ref: 'History',
    type: mongoose.Schema.Types.ObjectId
  }]
})

export const NFTModel = mongoose.model<INFT>('NFT', INFTSchema);
