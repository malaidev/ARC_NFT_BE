import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { IHistory } from "./IHistory";
import { INFT } from "./INFT";

export interface IPerson {
  _id?: string;                   // user id
  backgroundUrl: string;          // background image url
  photoUrl: string;               // photo image url
  wallet: string;                 // wallet address
  joinedDate: Date;               // joined date
  name: string;                   // display name

  nfts: Array<INFT>;              // owned nfts
  created: Array<INFT>;           // created nfts
  favourites: Array<INFT>;        // favourite nfts
  history: Array<IHistory>;       // activities of current user
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
  history: [{
    ref: 'History',
    type: ObjectId
  }],
});

export const PersonModel = mongoose.model<IPerson>('Person', IPersonSchema);
