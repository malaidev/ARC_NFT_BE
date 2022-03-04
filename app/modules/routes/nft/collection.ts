import { FastifyReply, FastifyRequest } from "fastify";
import { NFTCollectionController } from "../../controller/NFTCollectionController";

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getItems = async (req: FastifyRequest, res: FastifyReply) => {
  const collectionId = req['collectionId'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getItems(collectionId);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getOwners = async (req: FastifyRequest, res: FastifyReply) => {
  const collectionId = req['collectionId'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getOwners(collectionId);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const collectionId = req['collectionId'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getHistory(collectionId);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getActivities = async (req: FastifyRequest, res: FastifyReply) => {
  const collectionId = req['collectionId'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getActivity(collectionId);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
 export const createItem = async (req: FastifyRequest, res: FastifyReply) => {
   
};

