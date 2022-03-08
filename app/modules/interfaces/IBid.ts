import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { INFT } from "./INFT";
import { IPerson } from "./IPerson";

export interface IBid {
  _id?: string                    // id of activity
  collection: string;
  bidder: IPerson;               // bidder user id
  bidPrice: number;             // bid price
  status: string;               // current status of bid
  bidOn: INFT;                // NFT id
  type: string;
}

const IBidSchema = new mongoose.Schema<IBid>( {
  collection: String,
  bidder: {ref: 'Person', type: ObjectId},               // bidder user id
  bidPrice: String,             // bid price
  status: String,               // current status of bid
  bidOn: {ref: 'NFT', type: ObjectId},                // NFT id
});

export const BidModel = mongoose.model<IBid>('Bid', IBidSchema);
