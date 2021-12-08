import { loadMarketDetails, loadAllExchangesOrderBook } from './get';
import { compareExchangesOperation } from './compareExchanges';

export const marketDetails = async (router: any, options: any) => {
  router.get('/:exchangeName/:symbol', loadMarketDetails);
  router.get('/orderBook/:symbol/:walletId', loadAllExchangesOrderBook);
  
  router.post('/compare', compareExchangesOperation);
}
