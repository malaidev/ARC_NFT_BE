import { loadMarketOverview } from './get';

export const marketOverview = async (router: any, options: any) => {
  router.get('/:exchangeName/:quote', loadMarketOverview);
}