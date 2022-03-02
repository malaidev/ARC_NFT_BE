import { config } from "../../../config/config";

/**
 * Exports the nft collection actions routes.
 * @param {*} router
 * @param {*} options
 */
export const nft = async (router: any, options: any) => {
  router.get("/", config.route("jwt"), getAllItems);
  router.get("/wallet/:walletId", config.route("jwt"), getItemsByOne);
  router.get("/wallet/:walletId/history", config.route("jwt"), getHistory);
  router.get("/wallet/:walletId/activity", config.route("jwt"), getActivities);

  router.get("/item/:walletId/:itemId", config.route("jwt"), getItemDetail);
  router.get("/item/:walletId/:itemId/history", config.route("jwt"), getItemHistory);

  router.get("/user/:userId/list", config.route("jwt"), getUserLists);
  router.post("/user/:userId/update", config.route("jwt"), updateProfile);
  router.get("/user/:userId/detail", config.route("jwt"), getProfile);
  router.get("/user/:userId/history", config.route("jwt"), getUserHistory);
  router.get("/user/:userId/collection", config.route("jwt"), getUserCollections);
};
