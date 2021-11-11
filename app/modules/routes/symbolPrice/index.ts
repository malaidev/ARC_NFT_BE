import { getSymbolUsdtPrice } from './get'

/**
 * Exports the orders actions routes.
 * @param {*} router 
 * @param {*} options 
 */
 export const symbolPrice = async (router: any, options: any) => {
  router.get('/:symbol', getSymbolUsdtPrice);

}
