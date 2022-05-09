export interface INFT {
  _id?: string; // id of nft
  collection: string; // collection contract address
  index: number; // index of nft in collection
  owner: string; // owner
  owners: any;
  creator: string; // creator
  artURI: string; // URI of art image
  name: string; // nft name
  price: number; // price of nft
  externalLink?: string; // external link
  description?: string; // description of nft
  properties: Object; // traits of nft item
  lockContent?: string; // content
  isExplicit: boolean; // explicit flag
  explicitContent?: string; // explicit content
  royalties?: number; // royalties
  saleStatus: any;
  mintStatus: any;
  status_date?: number;
  tokenType: TokenType; // eq ERC721 or ERC 1155
  contentType: ContentType;
  timeLeft?: string;
  tag?:Array<string>;
}

export enum ContentType {
  MUSIC = <any>"Music",
  IMAGE = <any>"Image",
  VIDEO = <any>"Video",
  OTHER = <any>"Other",
}

export enum TokenType {
  ERC20 = <any>"ERC20",
  ERC721 = <any>"ERC721",
  ERC1155 = <any>"ERC1155",
}
export interface IPrice {
  price: number;
  timestamp: Date;
}

export enum SaleStatus {
  NOTFORSALE = <any>"Not For Sale",
  FORSALE = <any>"For Sale",
}
export enum MintStatus {
  LAZYMINTED = <any>"Lazy Minted",
  MINTED = <any>"Minted",
}
