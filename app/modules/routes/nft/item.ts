import { FastifyReply, FastifyRequest } from "fastify";
import { NFTController } from "../../controller/NFTController";

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getItemDetail = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId} = req.params as any;
  const ctl = new NFTController();
  const result = await ctl.getItemDetail(contract, nftId);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
 export const getItemHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId} = req.params as any;
  const ctl = new NFTController();
  const result = await ctl.getItemHistory(contract, nftId);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
 export const getAllItems = async (req: FastifyRequest, res: FastifyReply) => {
  // res.send(result);
  };
  

/**
 * 
 * @param {*} req
 * @param {*} res
 */
 export const createItem = async (req: FastifyRequest, res: FastifyReply) => {

};