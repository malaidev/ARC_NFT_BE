import { FastifyReply, FastifyRequest } from "fastify";

import { NFTOwnerController } from "../../controller/NFTOwnerController";
import { IPerson } from "../../interfaces/INFT";
import { IUser } from "../../interfaces/IUser";
import { IWallet } from "../../interfaces/IWallet";
/**
 * 
 * @param {*} req
 * @param {*} res
 */


export const createOwner = async (req: FastifyRequest, res: FastifyReply) => {
    const owner:IPerson = req.body as any;
    const ctl = new NFTOwnerController(owner);
    const user = req['session'] as any;
    try {
        let wallet: IWallet = {address: user.walletId}
        owner.wallet = { ...wallet };
        owner.id=user.walletId;
        const hasOwner = (await ctl.findPerson(user.walletId) as IUser);
        if (hasOwner.success===false) {
            const result = await ctl.create();
            res.code(200).send(result);
            
        } else {
            res.send(hasOwner)
            
        }
    } catch (error) {
        res.code(400).send(error);
    }
};

export const updateNftOwner = async (req: FastifyRequest, res: FastifyReply) => {
    const nft=req.body as any;
    const ctl = new NFTOwnerController();
    // const {walletId} = req.params as any;
    const user = req['session'].walletId as any;
    try {
        const hasOwner = (await ctl.findPerson(user) as IUser);
        

    } catch (error) {
        res.code(400).send(error);
    }
};


/**
 * 
 * @param {*} req
 * @param {*} res
 */
 export const getAllOwners = async (req: FastifyRequest, res: FastifyReply) => {
    const collectionId = req['collectionId'] as any;
    const ctl = new NFTOwnerController();
    const result = await ctl.findAllOwners();
    res.send(result);
  };

  