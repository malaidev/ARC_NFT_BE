import { config } from "../../../config/config";
import { createItem, getAllItems, getItemDetail, getItemHistory, getItemOffers, getTrendingItems } from "./item";
import { getCollections, getActivities, getHistory, getItems, getOwners, createCollection, getCollectionDetail, getTopCollections } from "./collection";
import { createOwner, getAllOwners, getOwner, getOwnerCollection, getOwnerHistory, getOwnerNtfs, getOwnerOffers, updateOwner} from "./owner";
import { approveOffer, makeOffer, getAllActivites, listForSale, transfer, cancelOffer, cancelListForSale } from "./activity";

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
  router.get("/collection/top", getTopCollections);
  router.get("/collection/:contract/items", getItems);
  router.get("/collection/:contract/owners",  getOwners);
  router.get("/collection/:contract/history", getHistory);
  router.get("/collection/:contract/activity",getActivities);
  router.get("/collection/:contract",getCollectionDetail);
  router.post("/collection/create", createCollection);

  router.get("/activity", getAllActivites);
  router.post("/activity/listForSale", listForSale);
  router.post("/activity/makeOffer", makeOffer);
  router.post("/activity/approveOffer", approveOffer);
  router.post("/activity/transfer", transfer);
  router.post("/activity/cancelOffer", cancelOffer);
  router.post("/activity/cancelListForSale", cancelListForSale);

  router.get("/items", getAllItems);
  router.post("/items/create", config.route("jwt"), createItem);
  router.get("/items/:contract/:nftId/history", getItemHistory);
  router.get("/items/:contract/:nftId/offers", getItemOffers);
  router.get("/items/:contract/:nftId", getItemDetail);
  router.get("/items/trending", getTrendingItems);
  
  router.get("/owners", getAllOwners);  

  router.post("/owners/:ownerId", config.route("jwt"), createOwner);
  router.put("/owners/:ownerId", config.route("jwt"),  updateOwner);

  router.get("/owners/:ownerId",  getOwner);  
  router.get("/owners/:ownerId/nfts", getOwnerNtfs)
  router.get("/owners/:ownerId/history",getOwnerHistory)
  router.get("/owners/:ownerId/collection",getOwnerCollection)
  router.get("/owners/:ownerId/offers",getOwnerOffers)
};
