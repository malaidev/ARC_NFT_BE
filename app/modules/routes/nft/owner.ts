import { FastifyReply, FastifyRequest } from "fastify";
import { NFTOwnerController } from "../../controller/NFTOwnerController";
import { IPerson } from "../../interfaces/IPerson";
import { IUser } from "../../interfaces/IUser";
import { IWallet } from "../../interfaces/IWallet";
import { parseQueryUrl } from "../../util/parse-query-url";
import { respond } from "../../util/respond";

export const uploadOwnerPhoto = async (req, res) => {
  const { ownerId } = req.params as any;
  const userSession = req["session"] as any;
  if (req.body && !req.body.photoFile) {
    return res.code(400).send("Please upload file ");
  }

  if (userSession.walletId.toLowerCase() !== ownerId.toLowerCase()) {
    return res.code(400).send("Wallet Id not equal with Wallet Login Session");
  }
  const { photoFile } = req.body as any;
  const photoBody =
    "data:" +
    req.body.photoFile.mimetype +
    ";base64," +
    Buffer.from(await req.body.photoFile.toBuffer()).toString("base64"); // access files
  const ctl = new NFTOwnerController();
  const result = await ctl.updateOwnerPhoto(ownerId.toLowerCase(), photoBody);
  res.send(result);
};

/**
 * 
 * @param {*} req
 *  ownerId: string 
 * @requestBody 
 
 photoUrl: string;                     // photo image url
  wallet: string;                       // wallet address
  username?: string;                     // username
  bio?: string;                          // display name
  social?: string;
 *  
 * @param {*} res
 *     result of owner
 *      success:  201
 *      fail:     501
 */
export const createOwner = async (req: FastifyRequest, res: FastifyReply) => {
  const { photoUrl, bio, username, social, email , optIn} = req.body as any;
  const { ownerId } = req.params as any;
  const userSession = req["session"] as any; 

  const user = { walletId: ownerId };
  if (userSession.walletId.toLowerCase() !== ownerId.toLowerCase()) {
    return res.code(400).send("Wallet Id not equal to the Login Session");
  }
  const ctl = new NFTOwnerController();
 
  const result = await ctl.createOwner( photoUrl, user.walletId.toLowerCase(), bio, username,social, email, optIn);
 
  res.send(result);
};
/**
 * 
 * @param req 
 * ownerId: string 
 * @requestBody 
 photoUrl: string;                     // photo image url
  wallet: string;                       // wallet address
  username?: string;                     // username
  bio?: string;                          // display name
  social?: string;
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
  const user = ownerId.toLowerCase();
  try {
    const userSession = req["session"] as any;
    if (userSession.walletId.toLowerCase() !== ownerId.toLowerCase()) {
      return res.code(400).send("Wallet Id not equal to the Login Session");
    }

    const hasOwner = (await ctl.findPerson(user)) as IUser;
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
    _id?: string;                         // user id
    backgroundUrl: string;                // background image url
    photoUrl: string;                     // photo image url
    wallet: string;                       // wallet address
    joinedDate: Date;                     // joined date
    username: string;                     // username
    displayName: string;                  // display name

    nfts: Array<INFTSimple>;              // owned nfts
    created: Array<INFTSimple>;           // created nfts
    favourites: Array<INFTSimple>;        // favourite nfts
    history: Array<IHistory>;             // activities of current user
  }
 * 
 */
// export const getAllOwners = async (req: FastifyRequest, res: FastifyReply) => {
//   const query = req.url.split("?")[1];
//   const filters = parseQueryUrl(query);
//   const ctl = new NFTOwnerController();
//   filters.filters.length == 0 && req.query["filters"] ? (filters.filters = JSON.parse(req.query["filters"])) : null;
//   const result = await ctl.findAllOwners(filters);
//   res.send(result);
// };
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
  const walletId = req.params["ownerId"] as string;
  
  const ctl = new NFTOwnerController();
  


  const result = await ctl.findPerson(walletId.toLowerCase())
 
  res.send(result);
};
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
  const walletId = req.params["ownerId"] as string;
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query["filters"] ? (filters.filters = JSON.parse(req.query["filters"])) : null;
  const userSession = req["session"] as any;
    // if (userSession.walletId.toLowerCase() !== walletId.toLowerCase()) {
    //   return res.code(400).send("Wallet Id not equal to the Login Session");
    // }


  const ctl = new NFTOwnerController();
  const result = await ctl.getOwnerNtfs(walletId.toLowerCase(), filters);
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
  const walletId = req.params["ownerId"] as string;
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query["filters"] ? (filters.filters = JSON.parse(req.query["filters"])) : null;
  // const userSession = req["session"] as any;
  //   if (userSession.walletId.toLowerCase() !== walletId.toLowerCase()) {
  //     return res.code(400).send("Wallet Id not equal to the Login Session");
  //   }

  const ctl = new NFTOwnerController();
 
  const result = await ctl.getOwnerHistory(walletId.toLowerCase(),filters);
 
  res.send(result);
};

export const getOwnerOffers = async (req: FastifyRequest, res: FastifyReply) => {
  const walletId = req.params["ownerId"] as string;
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;
  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;
    // const userSession = req["session"] as any;
    // if (userSession.walletId.toLowerCase() !== walletId.toLowerCase()) {
    //   return res.code(400).send("Wallet Id not equal to the Login Session");
    // }

  const ctl = new NFTOwnerController();
 
  const result = await ctl.getOwnerOffers(walletId.toLowerCase(),filters);
 
  res.send(result);
};


/**
 * @param {*} req
 *  *    onwerId : wallet address
 * 
 * 
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
  const walletId = req.params["ownerId"] as string;
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;
  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;
    // const userSession = req["session"] as any;
    // if (userSession.walletId.toLowerCase() !== walletId.toLowerCase()) {
    //   return res.code(400).send("Wallet Id not equal to the Login Session");
    // }

  const ctl = new NFTOwnerController();
  const result = await ctl.getOwnerCollection(walletId.toLowerCase(), filters);
  res.send(result);
};

/**
 * @param(*) res
 *  ownerId,
 *  contract
 *  nftId
 * @returns favourites updated
 *
 *
 */

export const favourite = async (req: FastifyRequest, res: FastifyReply) => {
  const { walletId, contract, nftId } = req.body as any;
  const ctl = new NFTOwnerController();
 
  const result = await ctl.insertFavourite(walletId.toLowerCase(),contract,nftId)
 
  res.send(result);
};

/**
 * @param(*) res
 *  ownerId,
 *  contract
 *  nftId
 * @returns favourites removed
 *
 *
 */

export const removeFavourite = async (req: FastifyRequest, res: FastifyReply) => {
  const { walletId, contract, nftId } = req.body as any;
  const ctl = new NFTOwnerController();
 
  const result = await ctl.removeFavourite(walletId.toLowerCase(),contract,nftId)
 
  res.send(result);
};
