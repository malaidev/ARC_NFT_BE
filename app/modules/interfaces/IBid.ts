import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { IPerson } from "./IPerson";

export interface IBid {
  _id?: string                    // id of activity
  collection: string;             // collection contract address
  bidder: IPerson;                // bidder user
  bidPrice: number;               // bid price
  status: string;                 // current status of bid
  bidOn: string;                  // id of NFT item
  type: string;                   // type of bid
}

const IBidSchema = new mongoose.Schema<IBid>( {
  collection: String,
  bidder: {ref: 'Person', type: ObjectId},
  bidPrice: String,
  status: String,
  bidOn: String,
  type: String,
});

export const BidModel = mongoose.model<IBid>('Bid', IBidSchema);
