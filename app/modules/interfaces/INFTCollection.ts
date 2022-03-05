import { IWallet } from "./IWallet";
import * as mongoose from 'mongoose';
import { INFT } from "./INFT";
import { IActivity } from "./IActivity";
import { IPerson } from "./IPerson";

export interface INFTCollection {
  _id?: string;                  // id of nft collection - contract address
  name: string;                 // name of nft collection
  contract: string;
  nfts: Array<INFT>;
  owners: Array<IPerson>;
  activities: Array<IActivity>;
}

const INFTCollectionSchema = new mongoose.Schema<INFTCollection>( {
  name: String,
  contract: String,
  nfts: [{
    ref: 'NFT',
    type: mongoose.Schema.Types.ObjectId
  }],
  owners: [{
    ref: 'Owner',
    type: mongoose.Schema.Types.ObjectId
  }],
  activities: [{
    ref: 'Activity',
    type: mongoose.Schema.Types.ObjectId
  }]
})

export const NFTCollectionModel = mongoose.model<INFTCollection>('NFTCollection', INFTCollectionSchema);
