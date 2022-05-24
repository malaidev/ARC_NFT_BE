import { config } from "../../../config/config";
import {
  createItem,
  batchUpload,
  deleteItem,
  getAllItems,
  getItemDetail,
  getItemHistory,
  getItemOffers,
  getTrendingItems,
  updateItem,
  getTagItems,
  getBatchItem,
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
  getHotCollections,
  getTagCollections,
} from "./collection";
import {
  createOwner,
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
  listForSaleBatch,
} from "./activity";
import { claimReward, getReward, getRewardAirDrop, getTest } from "./reward";
import { sign } from "./sign";

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
  router.get("/collection/hot", getHotCollections);
  router.get("/collection/url/:url", getCollectionByUrl);
  router.get("/collection/:collectionId/items", getItems);
  router.get("/collection/:collectionId/owners", config.route("jwt"), getOwners);
  router.get("/collection/:collectionId/history",config.route("jwt"), getActivities);
  router.get("/collection/:collectionId/activity",config.route("jwt"), getActivities);
  router.get("/collection/:collectionId/offer", config.route("jwt"), getCollectionOffer);

  router.get("/collection/:collectionId", getCollectionDetail);
  router.get("/collection/tag/:tag",  getTagCollections);


  router.delete("/collection/:collectionId", config.route("jwt"), deleteCollection);
  router.put("/collection/:collectionId", config.route("jwt"), updateCollection);
  router.post("/collection/create", config.route("jwt"), createCollection);
  router.get("/activity",config.route("jwt"), getAllActivites);
  router.delete("/activity/:id", config.route("jwt"), deleteActivityId);
  router.post("/activity/listForSale", config.route("jwt"), listForSale);
  router.post("/activity/listForSale/:batchId", config.route("jwt"), listForSaleBatch);
  // router.post("/activity/listForSale/batch", config.route("jwt"), listForSaleBatch);
  router.post("/activity/makeOffer", config.route("jwt"), makeOffer);
  router.post("/activity/approveOffer", config.route("jwt"), approveOffer);
  router.post("/activity/transfer", config.route("jwt"), transfer);
  router.post("/activity/cancelOffer", config.route("jwt"), cancelOffer);
  router.post("/activity/cancelListForSale", config.route("jwt"), cancelListForSale);
  router.post("/activity/makeCollectionOffer", config.route("jwt"), makeCollectionOffer);
  router.post("/activity/cancelCollectionOffer", config.route("jwt"), cancelCollectionOffer);
  router.post("/activity/signOffer", config.route("jwt"), signOffer);

  router.get("/items", config.routeParamsValidationJWT("jwt"), getAllItems);
  router.get("/items/trending", config.routeParamsValidationJWT("jwt"),getTrendingItems);
  router.get("/items/tag/:tag",config.routeParamsValidationJWT("jwt"), getTagItems);

  router.post("/items/create", config.route("jwt"), createItem);
  router.get("/items/batch/:batchId",config.route("jwt"),getBatchItem)
  router.post("/items/batch-upload", config.route("jwt"), batchUpload);

  router.get("/items/:collectionId/:nftId/history",config.routeParamsValidation(), getItemHistory);
  router.get("/items/:collectionId/:nftId/offers", config.routeParamsValidation(), getItemOffers);
  router.get("/items/:collectionId/:nftId", config.routeParamsValidationJWT("jwt"), getItemDetail);
  router.put("/items/:nftId", config.route("jwt"), updateItem);
  router.delete("/items/:id", config.route("jwt"), deleteItem);

  // router.get("/owners", getAllOwners);
  router.post("/owners/:ownerId", config.route("jwt"), createOwner);
  router.post("/owners/:ownerId/upload-profile", config.route("jwt"), uploadOwnerPhoto);
  router.put("/owners/:ownerId", config.route("jwt"), updateOwner);
  router.get("/owners/:ownerId", getOwner);
  router.get("/owners/:ownerId/nfts", config.routeParamsValidationJWT("jwt"), getOwnerNtfs);
  router.get("/owners/:ownerId/history", config.route("jwt"), getOwnerHistory);
  router.get("/owners/:ownerId/collection",config.route("jwt"), getOwnerCollection);
  router.get("/owners/:ownerId/offers", config.route("jwt"), getOwnerOffers);

  router.get("/search", getCollectionsItems);
  router.get("/rewards/:walletId", config.route("jwt"), getReward);
  router.get("/rewards/airdrop/:walletId",config.route("jwt"), getRewardAirDrop);
  router.post("/rewardsClaim", config.route("jwt"), claimReward);
  // router.get("/rewards/test", getTest);

  router.post("/sign", config.route("jwt"), sign);
};
