import { IWallet } from "./IWallet";
import * as mongoose from 'mongoose';
import { INFT } from "./INFT";
import { IHistory } from "./IHistory";
import { IPerson } from "./IPerson";
import { IBid } from "./IBid";

export interface INFTCollection {
  _id?: string;                  // id of nft collection - contract address
  name: string;                 // name of nft collection
  contract: string;
  nfts: Array<INFT>;
  owners: Array<IPerson>;
  history: Array<IHistory>;
  activity: Array<IBid>;
}

const INFTCollectionSchema = new mongoose.Schema<INFTCollection>( {
  name: String,
  contract: String,
  nfts: [{
    ref: 'NFT',
    type: mongoose.Schema.Types.ObjectId
  }],
  owners: [{
    ref: 'Person',
    type: mongoose.Schema.Types.ObjectId
  }],
  history: [{
    ref: 'History',
    type: mongoose.Schema.Types.ObjectId
  }],
  activity: [{
    ref: 'Bid',
    type: mongoose.Schema.Types.ObjectId
  }]
})

export const NFTCollectionModel = mongoose.model<INFTCollection>('NFTCollection', INFTCollectionSchema);
