export interface IActivity {
  _id?: string;                     // id of activity
  collection: string;               // collection contract address
  nftId?: string;                    // id of nft item
  type: ActivityType;                     // type of activity collection, sale, mint, transfer, list
  price?: number;                   // price of activity
  from?: string;                    // original owner
  to?: string;                      // new owner
  by?: string;                      // mint by person
  date?: number;                    // date of activity
  startDate?: number;               // start date of activity
  endDate?: number;                 // end date of activity
  fee?: number;                     // fee of list for sale
  nonce?:number;                    // Nonce
  signature?:object;                // signature of activity
}


export enum ActivityType {
  OFFER=<any>"Offer",
  OFFERCOLLECTION=<any>"OfferCollection",
  SOLD=<any>"Sold",
  TRANSFER=<any>"Transfer",
  LISTFORSALE=<any>"List",
  CANCELED=<any>"Canceled",
  MINTED=<any>"Mint",
  NONE=<any>"None",
}