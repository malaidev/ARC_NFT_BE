import { IWallet } from "./IWallet";

export interface INFTCollection {
  id: string;                   // id of nft collection - contract address
  name: string;                 // name of nft collection
  nfts: Array<INFT>;
  owners: Array<string>;
  activities: Array<IActivity>;
}

export interface INFT {
  id: string;                   // id of nft
  owner: string;                // user id of owner
  ownerDetail?: IPerson;
  creator: string;              // user id of creator
  creatorDetail?: IPerson;
  artURI: string;               // URI of art image
  price: number;                // Current price of nft
  like: number;                 // likes count of nft
  auctionEnd?: Date;            // auction end time
  protocol?: string;            // protocol
  priceHistory: Array<IPrice>;       // price history list of nft
  activites: Array<IActivity>;       // activity list
  bids: Array<IBid>;                 // bids of current nft
  status: string;
}

export interface IPrice {
  id: string;
  price: number;
  timestamp: Date;
}

export interface IActivity {
  id: string                    // id of activity
  type: string;                 // type of activity (ex; list, offer, etc)
  price: number;                // price of activity
  from: string;                 // id of from user
  to: string;                   // id of to user
  date: Date;                   // date of activity
}

export interface IBid {
  id: string                    // id of bid
  bidder: string;               // bidder user id
  bidPrice: number;             // bid price
  status: string;               // current status of bid
  bidOn: string;                // NFT id
}

export interface IPerson {
  id: string;                   // user id
  backgroundUrl: string;        // background image url
  photoUrl: string;             // photo image url
  wallet: IWallet;              // wallet information
  joinedDate: Date;             // joined date
  name: string;                 // display name

  nfts: Array<string>;               // ids of owned nfts
  created: Array<string>;            // ids of created nfts
  favourites: Array<string>;         // ids of favourite nfts
  activity: Array<IActivity>;        // activities of current user
  offers: Array<IBid>;               // offers of current user
}
