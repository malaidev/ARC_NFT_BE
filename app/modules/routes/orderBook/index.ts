import { loadUserOrders } from './get';

export const userOrderBook = async (router: any, options: any) => {
  router.get('/:walletId/:marketType/:symbol', loadUserOrders);
}