import { getMarketBySymbol, getAllMarketsBySymbol  } from './get';

export const market = async (router: any, options: any) => {
  router.get('/:exchangeName/:symbol', getMarketBySymbol);
  router.get('/allmarkets/:symbol/:marketType', getAllMarketsBySymbol);
}
