import { config } from "../../../config/config";
import {
  createItem,
  bulkUpload,
  deleteItem,
  getAllItems,
  getItemDetail,
  getItemHistory,
  getItemOffers,
  getTrendingItems,
  updateItem,
} from "./item";

import {
  getCollections,
  getActivities,
  getHistory,
  getItems,
  getOwners,
  createCollection,
  getCollectionDetail,
  getCollectionByUrl,
  getTopCollections,
  getCollectionsItems,
  deleteCollection,
  getCollectionOffer,
  updateCollection,
} from "./collection";
import {
  createOwner,
  getAllOwners,
  getOwner,
  getOwnerCollection,
  getOwnerHistory,
  getOwnerNtfs,
  getOwnerOffers,
  updateOwner,
  uploadOwnerPhoto,
} from "./owner";
import {
  approveOffer,
  makeOffer,
  getAllActivites,
  listForSale,
  transfer,
  cancelOffer,
  cancelListForSale,
  makeCollectionOffer,
  cancelCollectionOffer,
  signOffer,
  deleteActivityId,
} from "./activity";
import { getReward } from "./reward";

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
  router.get("/collection/url/:url", getCollectionByUrl);
  router.get("/collection/:collectionId/items", config.routeParamsValidation(), getItems);
  router.get("/collection/:collectionId/owners", config.routeParamsValidation(), getOwners);
  router.get("/collection/:collectionId/history", config.routeParamsValidation(), getActivities);
  router.get("/collection/:collectionId/activity", config.routeParamsValidation(), getActivities);
  router.get("/collection/:collectionId/offer", config.routeParamsValidation(), getCollectionOffer);

  router.get("/collection/:collectionId", config.routeParamsValidation(), getCollectionDetail);
  router.delete("/collection/:collectionId", config.route("jwt"), deleteCollection);
  router.put("/collection/:collectionId", config.route("jwt"), updateCollection);
  router.post("/collection/create", config.route("jwt"), createCollection);
  router.get("/activity", getAllActivites);
  router.delete("/activity/:id", config.route("jwt"), deleteActivityId);
  router.post("/activity/listForSale", listForSale);
  router.post("/activity/makeOffer", makeOffer);
  router.post("/activity/approveOffer", approveOffer);
  router.post("/activity/transfer", transfer);
  router.post("/activity/cancelOffer", cancelOffer);
  router.post("/activity/cancelListForSale", cancelListForSale);
  router.post("/activity/makeCollectionOffer", makeCollectionOffer);
  router.post("/activity/cancelCollectionOffer", cancelCollectionOffer);
  router.post("/activity/signOffer", signOffer);

  router.get("/items", getAllItems);
  router.get("/items/trending", getTrendingItems);
  router.post("/items/create", config.route("jwt"), createItem);
  router.post("/items/bulk-upload", bulkUpload);
  router.get("/items/:collectionId/:nftId/history", config.routeParamsValidation(), getItemHistory);
  router.get("/items/:collectionId/:nftId/offers", config.routeParamsValidation(), getItemOffers);
  router.get("/items/:collectionId/:nftId", config.routeParamsValidation(), getItemDetail);
  router.put("/items/:nftId", config.route("jwt"), updateItem);
  router.delete("/items/:id", config.route("jwt"), deleteItem);

  router.get("/owners", getAllOwners);
  router.post("/owners/:ownerId", config.route("jwt"), createOwner);
  router.post("/owners/:ownerId/upload-profile", config.route("jwt"), uploadOwnerPhoto);
  router.put("/owners/:ownerId", config.route("jwt"), updateOwner);
  router.get("/owners/:ownerId", config.routeParamsValidation(), getOwner);
  router.get("/owners/:ownerId/nfts", config.routeParamsValidation(), getOwnerNtfs);
  router.get("/owners/:ownerId/history", config.routeParamsValidation(), getOwnerHistory);
  router.get("/owners/:ownerId/collection", config.routeParamsValidation(), getOwnerCollection);
  router.get("/owners/:ownerId/offers", config.routeParamsValidation(), getOwnerOffers);

  router.get("/search", getCollectionsItems);
  router.get("/rewards/:walletId", getReward);
  
};
