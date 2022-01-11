import { getTokenUsdtPrice, getTokenUsdtPrices } from "./get";

/**
 * Exports the orders actions routes.
 * @param {*} router
 * @param {*} options
 */
export const tokenPrice = async (router: any, options: any) => {
  router.get("/:symbol/:address", getTokenUsdtPrice);
  router.get("/:symbol", getTokenUsdtPrice);
  router.post("/", getTokenUsdtPrices);
};
