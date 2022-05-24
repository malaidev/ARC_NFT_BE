export interface INFTBatch {
    _id?: string; // id of nft
    batchId:string,
    owner:string,
    nonce:number,
    collection:string, 
    signature:any,
    forSale:Array<any>,
    notForSale:Array<any>
  }
   