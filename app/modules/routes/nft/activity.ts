import { FastifyReply, FastifyRequest } from "fastify";
import { ActivityController } from "../../controller/ActivityController";
import { parseQueryUrl } from "../../util/parse-query-url";

/**
 * Get all NFTs in collection
 * Method: GET
 * 
 * @param {*} req
 * @param {*} res
 *    Array<IActivity>
 */
 export const getAllActivites = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters=query?parseQueryUrl(query):null;
  filters && filters.filters.length==0 && req.query['filters']?filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new ActivityController();
  const result = await ctl.getAllActivites(filters);

  res.send(result);
};


/**
 * Owner place a bid to the NFT item in collection
 * Method: POST
 * 
 * @param {*} req
 *    contract: Collection Contract Address
 *    nftId:    Index of NFT item in collection
 *    seller:     seller wallet address
 *    price:    price for sale
 *    endDate:     end date
 *    fee:        seller's fee
 * @param {*} res
 *    success:  200
 *    fail:     501
 */
 export const listForSale = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, seller, price, endDate, fee,r,s,v} = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.listForSale(contract, nftId, seller, price ?? 0, endDate ?? 0, fee ?? 0,r??'',s??'',v??'');
  res.send(result);
};

export const makeOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, seller, buyer, price, endDate} = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.makeOffer(contract, nftId, seller, buyer, price, endDate);
  res.send(result);
};

export const approveOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, seller, buyer, activityId} = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.approveOffer(contract, nftId, seller, buyer, activityId);
  res.send(result);
};

export const transfer = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, seller, buyer} = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.transfer(contract, nftId, seller, buyer);
  res.send(result);
};

export const cancelOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, seller, buyer, activityId} = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.cancelOffer(contract, nftId, seller, buyer, activityId);
  res.send(result);
};


export const cancelListForSale = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, seller, activityId} = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.cancelListForSale(contract, nftId, seller, activityId);
  res.send(result);
};

export const signOffer=async (req: FastifyRequest, res: FastifyReply) =>{
  const {id,r,s,v} = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.signOffer(id,r,s,v);
  res.send(result);
}
