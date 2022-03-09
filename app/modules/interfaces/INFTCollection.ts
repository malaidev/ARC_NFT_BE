import * as mongoose from 'mongoose';
import { INFT } from "./INFT";
import { IHistory } from "./IHistory";
import { IPerson } from "./IPerson";
import { IBid } from "./IBid";

export interface INFTCollection {
  _id?: string;                  
  name: string;                 // name of nft collection
  contract: string;             // collection contract address
  nfts: Array<INFT>;            // nft list
  owners: Array<IPerson>;       // owner list
  history: Array<IHistory>;     // history of collection
  activity: Array<IBid>;        // activity of collection
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
