import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { IPerson } from "./IPerson";

export interface IHistory {
  _id?: string;                   // id of activity
  collection: string;             // collection contract address
  nftId: string;                  // id of nft item
  type: string;                   // type of activity (ex; list, offer, etc)
  price: number;                  // price of activity
  from: IPerson;                  // original owner
  to: IPerson;                    // new owner
  date: Date;                     // date of activity
}

const IHistorySchema = new mongoose.Schema<IHistory>( {
  collection: String,
  nftId: String,
  type: String,
  price: Number,
  from: {
    ref: 'Person',
    type: ObjectId
  },
  to: {
    ref: 'Person',
    type: ObjectId
  },
  date: Date
});

export const HistoryModel = mongoose.model<IHistory>('History', IHistorySchema);
