
export interface INFT {
  _id?: string;                   // id of nft
  collection: string;             // collection contract address
  index: string;                  // index of nft in collection
  owner: string;                  // owner
  creator: string;                // creator
  artURI: string;                 // URI of art image
  name: string;                   // nft name
  price: number;                  // price of nft
  externalLink?: string;          // external link
  description?: string;           // description of nft
  properties: Object;             // traits of nft item
  isLockContent: boolean;         // content flag
  lockContent?: string;           // content
  isExplicit: boolean;            // explicit flag
  explicitContent?: string;       // explicit content
  status?: string;                // For Sale, Minted, Sold
}

export interface IPrice {
  price: number;
  timestamp: Date;
}
