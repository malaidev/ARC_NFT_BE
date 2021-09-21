import { loadMarketDetails } from './get';

export const marketDetails = async (router: any, options: any) => {
  router.get('/:exchangeName/:symbol', loadMarketDetails);
}
