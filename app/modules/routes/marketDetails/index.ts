import { loadMarketDetails, loadAllExchangesOrderBook } from './get';

export const marketDetails = async (router: any, options: any) => {
  router.get('/:exchangeName/:symbol', loadMarketDetails);
  router.get('/:symbol', loadAllExchangesOrderBook);
}
