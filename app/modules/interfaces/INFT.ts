import mongoose from "mongoose";
import { IActivity } from "./IActivity";
import { IBid } from "./IBid";
import { IPerson } from "./IPerson";

export interface INFT {
  _id: string;                   // id of nft
  owner: IPerson;                // user id of owner
  creator: IPerson;              // user id of creator
  artURI: string;               // URI of art image
  price: number;                // Current price of nft
  like: number;                 // likes count of nft
  auctionEnd?: Date;            // auction end time
  protocol?: string;            // protocol
  priceHistory: Array<IPrice>;       // price history list of nft
  activities: Array<IActivity>;       // activity list
  bids: Array<IBid>;                 // bids of current nft
  status: string;
}

export interface IPrice {
  price: number;
  timestamp: Date;
}

const INFTSchema = new mongoose.Schema<INFT>( {
  owner: {
    ref: 'Owner',
    type: mongoose.Schema.Types.ObjectId
  },
  creator: {
    ref: 'Owner',
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
  bids: [{
    ref: 'Bid',
    type: mongoose.Schema.Types.ObjectId
  }],
  activities: [{
    ref: 'Activity',
    type: mongoose.Schema.Types.ObjectId
  }]
})

export const NFTModel = mongoose.model<INFT>('NFTCollection', INFTSchema);
