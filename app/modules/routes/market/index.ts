import { getMarketBySymbol } from './get';

export const market = async (router: any, options: any) => {
  router.get('/:exchangeName/:symbol', getMarketBySymbol);
}
