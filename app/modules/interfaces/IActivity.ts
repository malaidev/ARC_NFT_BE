import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { IPerson } from "./IPerson";

export interface IActivity {
  _id?: string                    // id of activity
  type: string;                 // type of activity (ex; list, offer, etc)
  price: number;                // price of activity
  from: IPerson;                 // id of from user
  to: IPerson;                   // id of to user
  date: Date;                   // date of activity
}


const IActivitySchema = new mongoose.Schema<IActivity>( {
  type: String,
  price: Number,
  from: {
    ref: 'Owner',
    type: ObjectId
  },
  to: {
    ref: 'Owner',
    type: ObjectId
  },
  date: Date
});

export const ActivityModel = mongoose.model<IActivity>('NFTCollection', IActivitySchema);
