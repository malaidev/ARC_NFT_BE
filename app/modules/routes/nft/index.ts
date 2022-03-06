import { config } from "../../../config/config";
import { createItem, getItemDetail, getItemHistory } from "./item";
import { getProfile, getUserCollections, getUserHistory, getUserLists, updateProfile } from "./user";
import { getActivities, getHistory, getItems, getOwners, createCollection } from "./collection";
import { createOwner,getAllOwners, updateOwner } from "./owner";

/**
 * Exports the nft collection actions routes.
 * @param {*} router
 * @param {*} options
 */
export const nft = async (router: any, options: any) => {
  router.get("/collection/:contract/items", config.route("jwt"), getItems);
  router.get("/collection/:contract/owners", config.route("jwt"), getOwners);
  router.get("/collection/:contract/history", config.route("jwt"), getHistory);
  router.get("/collection/:contract/activity", config.route("jwt"), getActivities);

  router.post("/collection/create", config.route("jwt"), createCollection);

  router.get("/items", config.route("jwt"), getItems);
  router.get("/owners", config.route("jwt"), getAllOwners);  
  router.post("/owners", config.route("jwt"), createOwner);
  router.put("/owners", config.route("jwt"), updateOwner);

  router.get("/:nftId/history", config.route("jwt"), getHistory);
  router.get("/:nftId/activity", config.route("jwt"), getActivities);
  router.post("/items/create", config.route("jwt"), createItem);

  router.get("/item/:walletId/:itemId", config.route("jwt"), getItemDetail);
  router.get("/item/:walletId/:itemId/history", config.route("jwt"), getItemHistory);

  router.get("/user/:userId/list", config.route("jwt"), getUserLists);
  router.post("/user/:userId/update", config.route("jwt"), updateProfile);
  router.get("/user/:userId/detail", config.route("jwt"), getProfile);
  router.get("/user/:userId/history", config.route("jwt"), getUserHistory);
  router.get("/user/:userId/collection", config.route("jwt"), getUserCollections);
};
