import { config } from "../../../config/config";
import { createItem,
  getAllItems,
  getItemDetail,
  getItemHistory,
  getItemOffers,
  getTrendingItems
} from "./item";
import { 
  getCollections, 
  getActivities, 
  getHistory, 
  getItems, 
  getOwners, 
  createCollection, 
  getCollectionDetail, 
  getTopCollections, 
  getCollectionsItems
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
  uploadOwnerPhoto
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
  cancelCollectionOffer
} from "./activity";

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
  router.get("/collection/:contract/items", config.routeParamsValidation(),getItems);
  router.get("/collection/:contract/owners",  config.routeParamsValidation(),getOwners);
  router.get("/collection/:contract/history",config.routeParamsValidation(), getHistory);
  router.get("/collection/:contract/activity",config.routeParamsValidation(),getActivities);
  router.get("/collection/:contract",config.routeParamsValidation(),getCollectionDetail);
  router.post("/collection/create", config.route("jwt"), createCollection);

  router.get("/activity", getAllActivites);
  router.post("/activity/listForSale", listForSale);
  router.post("/activity/makeOffer", makeOffer);
  router.post("/activity/approveOffer", approveOffer);
  router.post("/activity/transfer", transfer);
  router.post("/activity/cancelOffer", cancelOffer);
  router.post("/activity/cancelListForSale", cancelListForSale);
  router.post("/activity/makeCollectionOffer", makeCollectionOffer);
  router.post("/activity/cancelCollectionOffer", cancelCollectionOffer);

  router.get("/items", getAllItems);
  router.post("/items/create", config.route("jwt"), createItem);
  router.get("/items/:contract/:nftId/history",config.routeParamsValidation(), getItemHistory);
  router.get("/items/:contract/:nftId/offers", config.routeParamsValidation(),getItemOffers);
  router.get("/items/:contract/:nftId",config.routeParamsValidation(), getItemDetail);
  router.get("/items/trending", getTrendingItems);
  
  router.get("/owners", getAllOwners);

  router.post("/owners/:ownerId", config.route("jwt"), createOwner);
  router.post("/owners/:ownerId/upload-profile",config.route("jwt"),  uploadOwnerPhoto);  
  router.put("/owners/:ownerId", config.route("jwt"),  updateOwner);

  router.get("/owners/:ownerId",config.routeParamsValidation(),  getOwner);  
  
  router.get("/owners/:ownerId/nfts",config.routeParamsValidation(), getOwnerNtfs)
  router.get("/owners/:ownerId/history",config.routeParamsValidation(),getOwnerHistory)
  router.get("/owners/:ownerId/collection",config.routeParamsValidation(),getOwnerCollection)
  router.get("/owners/:ownerId/offers",config.routeParamsValidation(),getOwnerOffers)

  router.get("/search",getCollectionsItems)
};
