import mongoose from "mongoose";
import { IHistory } from "./IHistory";
import { IBid } from "./IBid";
import { IPerson } from "./IPerson";

export interface INFT {
  _id?: string;                   // id of nft
  collection: string;
  index: string;
  owner: IPerson;                // user id of owner
  creator: IPerson;              // user id of creator
  artURI: string;               // URI of art image
  price: number;                // Current price of nft
  like: number;                 // likes count of nft
  auctionEnd?: Date;            // auction end time
  protocol?: string;            // protocol
  priceHistory: Array<IPrice>;       // price history list of nft
  history: Array<IHistory>;       // history list
  status: string;
}

export interface IPrice {
  price: number;
  timestamp: Date;
}

const INFTSchema = new mongoose.Schema<INFT>( {
  contract: String,
  index: String,
  owner: {
    ref: 'Person',
    type: mongoose.Schema.Types.ObjectId
  },
  creator: {
    ref: 'Person',
    type: mongoose.Schema.Types.ObjectId
  },
  artURI: String,               // URI of art image
  price: Number,                // Current price of nft
  like: Number,                 // likes count of nft
  auctionEnd: Date,            // auction end time
  protocol: String,            // protocol
  priceHistory: [{
    price: Number,
    timestamp: Date
  }],       // price history list of nft
  status: String,
  history: [{
    ref: 'History',
    type: mongoose.Schema.Types.ObjectId
  }]
})

export const NFTModel = mongoose.model<INFT>('NFT', INFTSchema);
