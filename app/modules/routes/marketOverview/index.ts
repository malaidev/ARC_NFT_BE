import { loadMarketOverview, loadSymbolOverview } from './get';
import { loadMarketOverviewFuture, loadSymbolOverviewFuture } from './getFuture';

export const marketOverview = async (router: any, options: any) => {
  router.get('/spot/:exchangeName/:quote', loadMarketOverview);
  router.get('/future/:exchangeName/:quote', loadMarketOverviewFuture);
  
  router.get('/overview/:type/:symbol', loadSymbolOverview);
}