import { FastifyReply, FastifyRequest } from "fastify";
import { NFTCollectionController } from "../../controller/NFTCollectionController";

/**
 * Get All Collections
 * Method: GET
 * 
 * @param {*} req
 * @param {*} res
 *    Array<INFTCollection>
      interface INFTCollection {
        _id?: string;                  
        logo: string;                 // uri of nft logo
        name: string;                 // name of nft collection
        creator: IPerson;             // creator of Collection
        contract: string;             // collection contract address
        floorPrice: number;           // Floor Price
        volume: number;               // Volume of collection
        latestPrice: number;          // Latest Price
        nfts: Array<INFT>;            // nft list
        owners: Array<IPerson>;       // owner list
        history: Array<IHistory>;     // history of collection
        activity: Array<IBid>;        // activity of collection
      }
 */
export const getCollections = async (req: FastifyRequest, res: FastifyReply) => {
  const ctl = new NFTCollectionController();
  const result = await ctl.getCollections();
  res.send(result);
};

/**
 * Get NFT Items in collection
 * Method: GET
 * 
 * @param {*} req
 *    contract: Collection Contract Address
 * @param {*} res
 *    Array<INFT>
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
 */
export const getItems = async (req: FastifyRequest, res: FastifyReply) => {
  const contract = req.params['contract'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getItems(contract);
  res.send(result);
};

/**
 * Get owner list in collection
 * Method: GET
 * 
 * @param {*} req
 *    contract: Collection Contract Address
 * @param {*} res
 *    Array<IPerson>
      interface IPerson {
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
 */
export const getOwners = async (req: FastifyRequest, res: FastifyReply) => {
  const contract = req.params['contract'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getOwners(contract);
  res.send(result);
};

/**
 * Get transfer history of NFT items in collection
 * Method: GET
 * 
 * @param {*} req
 *    contract: Collection Contract Address
 * @param {*} res
 *    Array<IHistory>
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
 */
export const getHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const contract = req.params['contract'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getHistory(contract);
  res.send(result);
};

/**
 * Get all activities (bids and transfer) of NFT items in collection
 * Method: GET
 * 
 * @param {*} req
 *     contract: Collection Contract Address
 * @param {*} res
 *      Array<IBid>
        interface IBid {
          _id?: string                    // id of activity
          collection: string;             // collection contract address
          bidder: IPerson;                // bidder user
          bidPrice: number;               // bid price
          status: string;                 // current status of bid
          bidOn: string;                  // id of NFT item
          type: string;                   // type of bid
        }
 */
export const getActivities = async (req: FastifyRequest, res: FastifyReply) => {
  const contract = req.params['contract'] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getActivity(contract);
  res.send(result);
};

/**
 * Create new collection - save to MongoDB
 * Method: POST
 * 
 * @param req 
 *    contract*: Collection Contract Address
 *    name*:     Collection Name
 *    logoUrl*:  logo url
 *    creator*:  creator wallet address
 *    featuredUrl?:
 *    bannerUrl?:
 *    URL?:
 *    description?:
 *    category*:
 *    linkSite?: 
 *    linkDiscord?:
 *    linkInstagram?:
 *    linkMedium?:
 *    linkTelegram?:
 *    creatorEarning?:
 *    blockchain*:
 *    isVerified*:
 *    isExplicit*:
 *    explicitContent?:
 *    
 * @param res 
 *    result of creation
 *      success:  201
 *      fail:     501
 */
export const createCollection = async (req: FastifyRequest, res: FastifyReply) => {
  const { contract, name, logoUrl, creator, 
    featuredUrl, bannerUrl, URL, description, category, 
    linkSite, linkDiscord, linkInstagram, linkMedium, linkTelegram, 
    creatorEarning, blockchain, isVerified, isExplicit, explicitContent } = req.body as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.createCollection(contract, name, logoUrl, creator, 
    featuredUrl, bannerUrl, URL, description, category, 
    linkSite, linkDiscord, linkInstagram, linkMedium, linkTelegram, 
    creatorEarning, blockchain, isVerified, isExplicit, explicitContent);
  res.send(result);
}

export const getCollectionDetail =async (req:FastifyRequest, res: FastifyReply) => {
  const {contract} = req.params as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getCollectionDetail(contract);
  res.send(result);
}
