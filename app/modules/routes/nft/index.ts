import { config } from "../../../config/config";
import { createItem, getAllItems, getItemDetail, getItemHistory, transferItem } from "./item";
import { getCollections, getActivities, getHistory, getItems, getOwners, createCollection, placeBid } from "./collection";
import { createOwner,favourite,getAllOwners, getOwner, getOwnerCollection, getOwnerHistory, getOwnerNtfs, removeFavourite, updateOwner } from "./owner";

/**
 * Exports the nft collection actions routes.
 * @param {*} router
 * @param {*} options
 */
export const  nft = async (router: any, options: any) => {
  /**
   * remove auth
   */
   router.get("/collection", getCollections);
   router.get("/collection/:contract/items", getItems);
   router.get("/collection/:contract/owners",  getOwners);
   router.get("/collection/:contract/history", getHistory);
   router.get("/collection/:contract/activity",getActivities);

   router.post("/collection/create", config.route("jwt"), createCollection);
   router.post("/collection/placeBid", config.route("jwt"), placeBid);
 
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

  //  router.post("/favourite/:ownerId/:contract/:nftId",favourite)
  router.post("/favourite",favourite)
  router.post("/favourite/dislike",removeFavourite)
  //  router.post("/favourite/:ownerId/:contract/:nftId/unlike",removeFavourite)



  // router.get("/collection/:contract/items", config.route("jwt"), getItems);
  // router.get("/collection/:contract/owners", config.route("jwt"), getOwners);
  // router.get("/collection/:contract/history", config.route("jwt"), getHistory);
  // router.get("/collection/:contract/activity", config.route("jwt"), getActivities);
  // router.post("/collection/create", config.route("jwt"), createCollection);
  // router.post("/collection/placeBid", config.route("jwt"), placeBid);
  // router.post("/items/create", config.route("jwt"), createItem);
  // router.get("/items/:contract", config.route("jwt"), getAllItems);
  // router.get("/items/:contract/:nftId/history", config.route("jwt"), getItemHistory);
  // router.get("/items/:contract/:nftId/detail", config.route("jwt"), getItemDetail);
  // router.post("/items/transfer", config.route("jwt"), transferItem);
  // router.get("/owners", config.route("jwt"), getAllOwners);  
  // router.post("/owners", config.route("jwt"), createOwner);
  // router.put("/owners", config.route("jwt"), updateOwner);
  // router.get("/owners/:ownerId", config.route("jwt"), getOwner);  
  // router.get("/owners/:ownerId/nfts",config.route("jwt"), getOwnerNtfs)
  // router.get("/owners/:ownerId/history",config.route("jwt"),getOwnerHistory)
  // router.get("/owners/:ownerId/collection",config.route("jwt"),getOwnerCollection)
};
