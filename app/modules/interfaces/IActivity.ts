export interface IActivity {
  _id?: string; // id of activity
  collection: string; // collection id
  nftId?: number; // id of nft item
  type: ActivityType; // type of activity collection, sale, mint, transfer, list
  price?: number; // price of activity
  from?: string; // original owner
  to?: string; // new owner
  by?: string; // mint by person
  date?: number; // date of activity
  startDate?: number; // start date of activity
  endDate?: number; // end date of activity
  fee?: number; // fee of list for sale
  nonce?: number; // Nonce
  signature?: object; // signature of activity
  active?: boolean;
  offerCollection?:number;
  batchId?:string,
  netPrice?:number,
  fromListener?:boolean

}

export enum ActivityType {
  MINTED = <any>"Mint",
  TRANSFER = <any>"Transfer",
  SALE = <any>"Sale",
  LIST = <any>"List",
  OFFER = <any>"Offer",
  CANCELLIST = <any>"Cancel list",
  CANCELOFFER = <any>"Cancel offer",
  OFFERCOLLECTION = <any>"OfferCollection",
  NONE = <any>"None",
}
