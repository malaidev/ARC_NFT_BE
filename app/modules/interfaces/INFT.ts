import mongoose from "mongoose";
import { IHistory } from "./IHistory";
import { IPerson } from "./IPerson";

export interface INFT {
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
  history: Array<IHistory>;       // history list
  status: string;                 // status of current nft
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
