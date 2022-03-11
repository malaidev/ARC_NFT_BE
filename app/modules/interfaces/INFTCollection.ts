import * as mongoose from 'mongoose';
import { INFT } from "./INFT";
import { IHistory } from "./IHistory";
import { IPerson } from "./IPerson";
import { IBid } from "./IBid";

export interface INFTCollection {
  _id?: string;                  
  logo: string;                 // uri of nft logo
  name: string;                 // name of nft collection
  creator: IPerson;             // creator of Collection
  contract: string;             // collection contract address
  floorPrice: number;           // Floor Price
  volume: number;               // Volume of collection
  latestPrice: number;          // Latest Price
  nfts: Array<INFT>;            // nft list
  owners: Array<IPerson>;       // owner list
  history: Array<IHistory>;     // history of collection
  activity: Array<IBid>;        // activity of collection
}

const INFTCollectionSchema = new mongoose.Schema<INFTCollection>( {
  name: String,
  contract: String,
  logo: String,
  creator: {
    ref: 'Person',
    type: mongoose.Schema.Types.ObjectId
  },
  floorPrice: Number,
  volume: Number,
  latestPrice: Number,
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
