import { config } from "../../../config/config";
import { createItem, getAllItems, getItemDetail, getItemHistory, transferItem } from "./item";
import { getCollections, getActivities, getHistory, getItems, getOwners, createCollection, getCollectionDetail } from "./collection";
import { createOwner,favourite,getAllOwners, getOwner, getOwnerCollection, getOwnerHistory, getOwnerNtfs, removeFavourite, updateOwner } from "./owner";
import { getAllActivites, placeBid } from "./activity";

/**
 * Exports the nft collection actions routes.
 * @param {*} router
 * @param {*} options
 */
export const nft = async (router: any, options: any) => {
  /**
   * remove auth
   */
  router.get("/collection", getCollections);
  router.get("/collection/:contract/items", getItems);
  router.get("/collection/:contract/owners",  getOwners);
  router.get("/collection/:contract/history", getHistory);
  router.get("/collection/:contract/activity",getActivities);
  router.get("/collection/:contract",getCollectionDetail);

  router.post("/collection/create", createCollection);

  router.get("/activity", getAllActivites);
  router.post("/activity/placeBid", config.route("jwt"), placeBid);

  router.post("/items/create", config.route("jwt"), createItem);
  
  router.get("/items", getAllItems);

  router.get("/items/:contract/:nftId/history", getItemHistory);
  router.get("/items/:contract/:nftId/detail", getItemDetail);
  router.post("/items/transfer", config.route("jwt"), transferItem);
  
  router.get("/owners", getAllOwners);  

  router.post("/owners/:ownerId", config.route("jwt"), createOwner);
  router.put("/owners/:ownerId", config.route("jwt"),  updateOwner);

  router.get("/owners/:ownerId",  getOwner);  
  router.get("/owners/:ownerId/nfts", getOwnerNtfs)
  router.get("/owners/:ownerId/history",getOwnerHistory)
  router.get("/owners/:ownerId/collection",getOwnerCollection)

  // router.post("/favourite",favourite)
  // router.post("/favourite/dislike",removeFavourite)

};
