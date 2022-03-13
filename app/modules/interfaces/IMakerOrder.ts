
export interface IMakerOrder {
  isOrderAsk: boolean; // true --> ask / false --> bid
  signer: string; // signer address of the maker order
  collection: string; // collection address
  price: number; // price (used as )
  tokenId: number; // id of the token
  amount: number; // amount of tokens to sell/purchase (must be 1 for ERC721, 1+ for ERC1155)
  strategy: string; // strategy for trade execution (e.g., DutchAuction, StandardSaleForFixedPrice) -- address
  currency: string; // currency (e.g., WETH) -- address
  nonce: number; // order nonce (must be unique unless new maker order is meant to override existing one e.g., lower ask price)
  startTime: number; // startTime in timestamp
  endTime: number; // endTime in timestamp
  minPercentageToAsk: number; // slippage protection (9000 --> 90% of the final price must return to ask)
  params: Array<Object>; // additional parameters
  v: number; // v: parameter (27 or 28)
  r: Array<number>; // r: parameter
  s: Array<number>; // s: parameter
}
