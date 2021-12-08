import { sendOrder, sendCancelOrder } from './get';

/**
 * Exports the orders actions routes.
 * @param {*} router 
 * @param {*} options 
 */
 export const order = async (router: any, options: any) => {
  router.post('/:exchangeName', sendOrder);
  router.post('/cancel/:walletId/:exchangeName/:orderId/:symbol', sendCancelOrder);
}
