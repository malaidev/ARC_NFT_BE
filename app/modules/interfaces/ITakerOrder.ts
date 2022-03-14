export interface ITakerOrder {
  isOrderAsk: boolean; // true --> ask / false --> bid
  taker: string; // msg.sender
  price: number; // final price for the purchase
  tokenId: number;
  minPercentageToAsk: number; // // slippage protection (9000 --> 90% of the final price must return to ask)
  params: Array<number>; // other params (e.g., tokenId)
}
