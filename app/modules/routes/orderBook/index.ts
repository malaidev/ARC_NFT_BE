import { loadUserOrders } from './get';
import { config } from "../../../config/config";
export const userOrderBook = async (router: any, options: any) => {

  router.get('/:walletId/:marketType/:symbol',config.route("jwt"), loadUserOrders);
}