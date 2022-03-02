export interface INFT {
  id: string;                   // id of nft
  owner: string;                // user id of owner
  creator: string;              // user id of creator
  artURI: string;               // URI of art image
  price: number;                // Current price of nft
  like: number;                 // likes count of nft
  auctionEnd?: Date;            // auction end time
  protocol?: string;            // protocol
  priceHistory: [IPrice];       // price history list of nft
  activites: [IActivity];       // activity list
  bids: [IBid];                 // bids of current nft
  collectionId: string          // collection id
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

export interface INFTCollection {
  id: string;                   // id of nft collection
  name: string;                 // name of nft collection
}

export interface IBid {
  id: string                    // id of bid
  bidder: string;               // bidder user id
  bidPrice: number;             // bid price
  status: string;               // current status of bid
  bidOn: string;                // NFT id
}

export interface IOwner {
  id: string;
  nfts: [string];               // id of nfts
  created: [string];
  favourites: [string];
  activity: [IActivity];
  offers: [IBid];
}