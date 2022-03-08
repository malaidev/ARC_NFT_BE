import { getMarketBySymbol, getAllMarketsBySymbol  } from './get';


const opts = {
  schema: {
    tags: ['Market']   
  }
}

export const market = async (router: any, options: any) => {
  router.get('/:exchangeName/:symbol', getMarketBySymbol);
  router.get('/allmarkets/:symbol/:marketType', getAllMarketsBySymbol);
}
