import { FastifyReply, FastifyRequest } from "fastify";
import { IPerson } from "../../interfaces/IPerson";
import { IUser } from "../../interfaces/IUser";
import { IWallet } from "../../interfaces/IWallet";
import { INFTReward } from "../../interfaces/INFTReward";
import { parseQueryUrl } from "../../util/parse-query-url";
import { respond } from "../../util/respond";
import { NFTRewardController } from "../../controller/NFTRewardController";



export const getReward = async (req: FastifyRequest, res: FastifyReply) => {
    const { ownerId } = req.params as any;
    
    const ctl = new NFTRewardController();
    const result = await ctl.getReward(ownerId);
    res.send(result);
}