import { FastifyReply, FastifyRequest } from "fastify";
import { NFTController } from "../../controller/NFTCollectionController";

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getItems = async (req: FastifyRequest, res: FastifyReply) => {
  const ctl = new NFTController();
  const result = await ctl.getItems();
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getOwners = async (req: FastifyRequest, res: FastifyReply) => {
  const ctl = new NFTController();
  const result = await ctl.getOwners();
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const item = req['item'] as any;
  const ctl = new NFTController();
  const result = await ctl.getHistory(item?.id);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getActivities = async (req: FastifyRequest, res: FastifyReply) => {
  const item = req['item'] as any;
  const ctl = new NFTController();
  const result = await ctl.getActivity(item?.id);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
 export const createItem = async (req: FastifyRequest, res: FastifyReply) => {
   
};

