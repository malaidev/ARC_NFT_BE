import { FastifyReply, FastifyRequest } from "fastify";
import { NFTOwnerController } from "../../controller/NFTOwnerController";
import { IPerson } from "../../interfaces/IPerson";
import { IUser } from "../../interfaces/IUser";
import { IWallet } from "../../interfaces/IWallet";
import { parseQueryUrl } from "../../util/parse-query-url";
import { respond } from "../../util/respond";
/**
 * 
 * @param {*} req
 *  ownerId: string 
 * @requestBody 
 *    backgroundUrl: url background
 *    photoUrl:  url photo
 *    name: name of owner
 *  
 * @param {*} res
 *     result of owner
 *      success:  201
 *      fail:     501
 */
export const createOwner = async (req: FastifyRequest, res: FastifyReply) => {
  // const owner:IPerson = req.body as any;
  // const ctl = new NFTOwnerController(owner);
  // const user = req['session'] as any;
  // try {
  //     owner.wallet = user.walletId;
  //     const hasOwner = (await ctl.findPerson(user.walletId) as IUser);
  //     if (hasOwner.success===false) {
  //         const result = await ctl.create();
  //         res.code(200).send(result);
  //     } else {
  //         return respond("Current Owner has been created already", true, 501);
  //     }
  // } catch (error) {
  //     res.code(400).send(error);
  // }
  const { backgroundUrl, photoUrl, joinedDate, name } = req.body as any;
  /** remove the auth */
  // const user = req['session'] as any;
  const { ownerId } = req.params as any;
  const user = { walletId: ownerId };
  const ctl = new NFTOwnerController();
  const result = await ctl.createOwner(backgroundUrl, photoUrl, user.walletId, joinedDate, name);
  res.send(result);
};
/**
 * 
 * @param req 
 * ownerId: string 
 * @requestBody 
 *    backgroundUrl: url background
 *    photoUrl:  url photo
 *    name: name of owner
 * @param res 
 *      result of owner
 *      success:  201
 *      fail:     501
 */
export const updateOwner = async (req: FastifyRequest, res: FastifyReply) => {
  const Owner = req.body as IPerson;
  const ctl = new NFTOwnerController();
  /**remove Auth */
  // const user = req['session'].walletId as any;
  const { ownerId } = req.params as any;
  const user = ownerId;
  try {
    const hasOwner = (await ctl.findPerson(user) as IUser);
    if (hasOwner.success === false) {
      res.code(400).send(hasOwner);
    } else {
      const result = await ctl.updateOwner(user, { ...Owner });
      res.send(result);
    }
  } catch (error) {
    res.code(400).send(error);
  }
};
/**
 * 
 * @param {*} req
 * @queryString  
   * filter IQuerFilter
   *  OrderBy= fieldName 
   *  direction=ASC/DESC, 
   * filters :[{fieldName:@field,query:@value}]
 * @param {*} res
 * Array <IPerson>
 * interface IPerson {
  _id?: string;                   // user id
  backgroundUrl: string;          // background image url
  photoUrl: string;               // photo image url
  wallet: string;                 // wallet address
  joinedDate: Date;               // joined date
  name: string;                   // display name
  nfts: Array<INFT>;              // owned nfts
  created: Array<INFT>;           // created nfts
  favourites: Array<INFT>;        // favourite nfts
  history: Array<IHistory>;       // activities of current user
}
 * 
 */
export const getAllOwners = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  const ctl = new NFTOwnerController();
  filters.filters.length == 0 && req.query['filters'] ? filters.filters = JSON.parse(req.query['filters']) : null;
  const result = await ctl.findAllOwners(filters);
  res.send(result);
};
/**
 * @param {*} req
 *  *    onwerId : wallet address
 * 
 * 
 * @param {*} res
 * * Object <IPerson>
* interface IPerson {
  _id?: string;                   // user id
  backgroundUrl: string;          // background image url
  photoUrl: string;               // photo image url
  wallet: string;                 // wallet address
  joinedDate: Date;               // joined date
  name: string;                   // display name
  nfts: Array<INFT>;              // owned nfts
  created: Array<INFT>;           // created nfts
  favourites: Array<INFT>;        // favourite nfts
  history: Array<IHistory>;       // activities of current user
  }
 * 
 */
export const getOwner = async (req: FastifyRequest, res: FastifyReply) => {
  const walletId = req.params['ownerId'] as string;
  const ctl = new NFTOwnerController();
  const result = await ctl.findOwner(walletId)
  res.send(result);
}
/**
 * @param {*} req
 *  *    onwerId : wallet address
 * @param {*} res
 * * Array <INFT>
interface INFT {
_id?: string;                   // id of nft
collection: string;             // collection contract address
index: string;                  // index of nft in collection
owner: IPerson;                 // owner
creator: IPerson;               // creator
artURI: string;                 // URI of art image
price: number;                  // Current price of nft
like: number;                   // likes count of nft
auctionEnd?: Date;              // auction end time
protocol?: string;              // protocol
priceHistory: Array<IPrice>;    // price history list of nft
history: Array<IHistory>;       // history list
status: string;                 // status of current nft
}
 * 
 */
export const getOwnerNtfs = async (req: FastifyRequest, res: FastifyReply) => {
  const walletId = req.params['ownerId'] as string;
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query['filters'] ? filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTOwnerController();
  const result = await ctl.getOwnerNtfs(walletId, filters);
  res.send(result);
};
/**
 * @param {*} req
 *  *    onwerId : wallet address
 * 
 * 
 * @param {*} res
 * * Array <IHistory>
interface IHistory {
_id?: string;                   // id of activity
collection: string;             // collection contract address
nftId: string;                  // id of nft item
type: string;                   // type of activity (ex; list, offer, etc)
price: number;                  // price of activity
from: IPerson;                  // original owner
to: IPerson;                    // new owner
date: Date;                     // date of activity
}
 * 
 */
export const getOwnerHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const walletId = req.params['ownerId'] as string;
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query['filters'] ? filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTOwnerController();
  const result = await ctl.getOwnerHistory(walletId);
  res.send(result);
};
/**
 * @param {*} req
 *  *    onwerId : wallet address
 * 
 * 
 * @param {*} res
 * * Array <INFTColelction>
interface INFTCollection {
_id?: string;                  
name: string;                 // name of nft collection
contract: string;             // collection contract address
nfts: Array<INFT>;            // nft list
owners: Array<IPerson>;       // owner list
history: Array<IHistory>;     // history of collection
activity: Array<IBid>;        // activity of collection
}
 * 
 */
export const getOwnerCollection = async (req: FastifyRequest, res: FastifyReply) => {
  const walletId = req.params['ownerId'] as string;
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query['filters'] ? filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTOwnerController();
  const result = await ctl.getOwnerCollection(walletId, filters);
  res.send(result);
};
