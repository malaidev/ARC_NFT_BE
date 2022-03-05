import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { IActivity } from "./IActivity";
import { IWallet } from "./IWallet";

export interface IPerson {
  _id?: string;                   // user id
  backgroundUrl: string;        // background image url
  photoUrl: string;             // photo image url
  wallet: string;              // wallet information
  joinedDate: Date;             // joined date
  name: string;                 // display name

  nfts: Array<string>;               // ids of owned nfts
  created: Array<string>;            // ids of created nfts
  favourites: Array<string>;         // ids of favourite nfts
  activity: Array<IActivity>;        // activities of current user
  offers: Array<IBid>;               // offers of current user
}



const IPersonSchema = new mongoose.Schema<IPerson>( {
  backgroundUrl: String,
  photoUrl: String,
  wallet: String,
  joinedDate: Date,
  name: String,
  nfts: [{
    ref: 'NFT',
    type: ObjectId
  }],
  created: [{
    ref: 'NFT',
    type: ObjectId
  }],
  favourites: [{
    ref: 'NFT',
    type: ObjectId
  }],
  activity: [{
    ref: 'Activity',
    type: ObjectId
  }],
  offers: [{
    ref: 'Bid',
    type: ObjectId
  }]
});

export const PersonModel = mongoose.model<IPerson>('NFTCollection', IPersonSchema);
