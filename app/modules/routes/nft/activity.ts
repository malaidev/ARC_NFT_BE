import { FastifyReply, FastifyRequest } from "fastify";
import { ActivityController } from "../../controller/ActivityController";

/**
 * Get all NFTs in collection
 * Method: GET
 * 
 * @param {*} req
 * @param {*} res
 *    Array<IActivity>
 */
 export const getAllActivites = async (req: FastifyRequest, res: FastifyReply) => {
  const ctl = new ActivityController();
  const result = await ctl.getAllActivites();
  res.send(result);
};


/**
 * Owner place a bid to the NFT item in collection
 * Method: POST
 * 
 * @param {*} req
 *    contract: Collection Contract Address
 *    nftId:    Index of NFT item in collection
 *    from:     Bidder wallet address
 *    price:    Bid price
 *    type:     Bid type
 * @param {*} res
 *    success:  201
 *    fail:     501
 */
 export const placeBid = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, from, price, type} = req.body as any;
  const ctl = new ActivityController();
  const result = await ctl.placeBid(contract, nftId, from, price, type);
  res.send(result);
};