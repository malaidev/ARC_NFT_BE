import { FastifyReply, FastifyRequest } from "fastify";
import { NFTCollectionController } from "../../controller/NFTCollectionController";

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getItems = async (req: FastifyRequest, res: FastifyReply) => {
  const contract = req.params['contract'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getItems(contract);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getOwners = async (req: FastifyRequest, res: FastifyReply) => {
  const contract = req.params['contract'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getOwners(contract);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const contract = req.params['contract'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getHistory(contract);
  res.send(result);
};

/**
 * 
 * @param {*} req
 * @param {*} res
 */
export const getActivities = async (req: FastifyRequest, res: FastifyReply) => {
  const contract = req.params['contract'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getActivity(contract);
  res.send(result);
};


export const createCollection = async (req: FastifyRequest, res: FastifyReply) => {
  const { contract, name } = req.body as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.createCollection(contract, name);
  res.send(result);
}

/**
 * 
 * @param {*} req
 * @param {*} res
 */
 export const placeBid = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, from, price, type, status} = req.params as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.placeBid(contract, nftId, from, price, type, status);
  res.send(result);
};
