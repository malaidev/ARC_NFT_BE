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
