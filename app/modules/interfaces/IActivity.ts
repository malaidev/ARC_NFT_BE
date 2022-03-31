export interface IActivity {
  _id?: string;                     // id of activity
  collection: string;               // collection contract address
  nftId: string;                    // id of nft item
  type: string;                     // type of activity collection, sale, mint, transfer, list
  price?: number;                   // price of activity
  from?: string;                    // original owner
  to?: string;                      // new owner
  by?: string;                      // mint by person
  date?: number;                    // date of activity
  startDate?: number;               // start date of activity
  endDate?: number;                 // end date of activity
  fee?: number;                     // fee of list for sale
  nonce?:number;                    // Nonce
}
