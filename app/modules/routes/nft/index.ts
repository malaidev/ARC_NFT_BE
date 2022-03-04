import { config } from "../../../config/config";
import { getItemDetail, getItemHistory } from "./item";
import { getProfile, getUserCollections, getUserHistory, getUserLists, updateProfile } from "./user";
import { getActivities, getHistory, getItems, getOwners, createItem } from "./collection";

/**
 * Exports the nft collection actions routes.
 * @param {*} router
 * @param {*} options
 */
export const nft = async (router: any, options: any) => {
  router.get("/collection/:collectionId/items", config.route("jwt"), getItems);
  router.get("/collection/:collectionId/owners", config.route("jwt"), getOwners);
  router.get("/collection/:collectionId/history", config.route("jwt"), getHistory);
  router.get("/collection/:collectionId/activity", config.route("jwt"), getActivities);

  router.post("/collection/create", config.route("jwt"), createCollection);
  router.post("/items/create", config.route("jwt"), createItem);

  router.get("/item/:walletId/:itemId", config.route("jwt"), getItemDetail);
  router.get("/item/:walletId/:itemId/history", config.route("jwt"), getItemHistory);

  router.get("/user/:userId/list", config.route("jwt"), getUserLists);
  router.post("/user/:userId/update", config.route("jwt"), updateProfile);
  router.get("/user/:userId/detail", config.route("jwt"), getProfile);
  router.get("/user/:userId/history", config.route("jwt"), getUserHistory);
  router.get("/user/:userId/collection", config.route("jwt"), getUserCollections);
};
function createCollection(arg0: string, arg1: { schema: { properties: { protected: { method: "jwt" | "token"; permission: string | number; }; }; }; }, createCollection: any) {
  throw new Error("Function not implemented.");
}

