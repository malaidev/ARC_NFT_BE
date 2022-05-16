import { sendOrder, sendCancelOrder } from './get';
import { config } from "../../../config/config";
/**
 * Exports the orders actions routes.
 * @param {*} router 
 * @param {*} options 
 */
 export const order = async (router: any, options: any) => {
  router.post('/:exchangeName', sendOrder);
  router.post('/cancel/:walletId/:exchangeName/:orderId/:symbol', sendCancelOrder);
}
