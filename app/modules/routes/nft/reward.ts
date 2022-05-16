import { FastifyReply, FastifyRequest } from "fastify";
import { IPerson } from "../../interfaces/IPerson";
import { IUser } from "../../interfaces/IUser";
import { IWallet } from "../../interfaces/IWallet";
import { INFTReward } from "../../interfaces/INFTReward";
import { parseQueryUrl } from "../../util/parse-query-url";
import { respond } from "../../util/respond";
import { NFTRewardController } from "../../controller/NFTRewardController";
import { rewardHelper } from "../../util/reward-handler";



export const getReward = async (req: FastifyRequest, res: FastifyReply) => {
    const { walletId } = req.params as any;
    const userSession = req["session"] as any;
    if (userSession.walletId.toLowerCase() !== walletId.toLowerCase()) {
      return res.code(400).send("Wallet Id not equal to the Login Session");
    }

    const ctl = new NFTRewardController();
    const result = await ctl.getReward(walletId.toLowerCase());
    res.send(result);
}


export const getRewardAirDrop = async (req: FastifyRequest, res: FastifyReply) => {
    const { walletId } = req.params as any;
    

        
    const ctl = new NFTRewardController();
    const result = await ctl.getRewardAirDrop(walletId.toLowerCase());

    res.send(result);
}
export const claimReward= async (req: FastifyRequest, res: FastifyReply) => {
    const { walletId,claim } = req.body as any;
    const userSession = req["session"] as any;
    if (userSession.walletId.toLowerCase() !== walletId.toLowerCase()) {
      return res.code(400).send("Wallet Id not equal to the Login Session");
    }

    const ctl = new NFTRewardController();
    const result = await ctl.claimReward(walletId.toLowerCase(),claim);
    res.send(result);
}


export const getTest = async (req: FastifyRequest, res: FastifyReply) => {
    const { walletId } = req.params as any;
    
    console.log('rewards')

    const ctl = new NFTRewardController();
    const x = new rewardHelper()
    x.calculateReward();
    res.send('ok');
    // const result = await ctl.getReward(walletId.toLowerCase());
    // res.send(result);
}
