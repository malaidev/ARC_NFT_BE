import { loadMarketOverview, loadSymbolOverview } from './get';

export const marketOverview = async (router: any, options: any) => {
  router.get('/:exchangeName/:quote', loadMarketOverview);
  router.get('/overview/:symbol', loadSymbolOverview);
}