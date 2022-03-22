import { FastifyReply, FastifyRequest } from "fastify";
import { NFTController } from "../../controller/NFTController";
import { parseQueryUrl } from "../../util/parse-query-url";

/**
 * Get NFT item detail information
 * Method: GET
 * 
 * @param {*} req
 *    contract: Collection Contract Address
 *    nftId:    NFT item index
 * @param {*} res
 *    INFT
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
export const getItemDetail = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId} = req.params as any;
  const ctl = new NFTController();
  const result = await ctl.getItemDetail(contract, nftId);
  res.send(result);
};

/**
 * Get NFT item history
 * Method: GET
 * 
 * @param {*} req
 *    contract: Collection Contract Address
 *    nftId:    NFT item index in collection
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
 export const getItemHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId} = req.params as any;
  const ctl = new NFTController();
  const result = await ctl.getItemHistory(contract, nftId);
  res.send(result);
};

/**
 * Get NFT item history
 * Method: GET
 * 
 * @param {*} req
 *    contract: Collection Contract Address
 *    nftId:    NFT item index in collection
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
export const getItemOffers = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId} = req.params as any;
  const ctl = new NFTController();
  const result = await ctl.getItemOffers(contract, nftId);
  res.send(result);
};

/**
 * Get all NFTs in collection
 * Method: GET
 * 
 * @param {*} req
 * @param {*} res
 *    Array<INFT>
 */
 export const getAllItems = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters=query?parseQueryUrl(query):null;
  filters && filters.filters.length==0 && req.query['filters']?filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTController();
  const result = await ctl.getItems(filters);
  res.send(result);
};

/**
 * Get all NFTs in collection
 * Method: GET
 * 
 * @param {*} req
 * @param {*} res
 *    Array<INFT>
 */
 export const getTrendingItems = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters=query?parseQueryUrl(query):null;
  filters && filters.filters.length==0 && req.query['filters']?filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTController();
  const result = await ctl.getTrendingItems(filters);
  res.send(result);
};

/**
 * Create NFT item - save to MongoDB
 * Method: POST
 * 
 * @param {*} req
 *    contract:     Collection Contract Address
 *    nftId:        NFT item index
 *    artURI:       URI of NFT item
 *    price:        price of NFT item
 *    ownerAddr:    Owner wallet address
 *    creatorAddr:  Creator wallet address
 * @param {*} res
 *    success:  201
 *    failure:  501 (cannot find collection)
 *              422 (cannot find owner and creator)
 */
export const createItem = async (req: FastifyRequest, res: FastifyReply) => {
  const {contract, nftId, artURI, price, ownerAddr, creatorAddr,properties} = req.body as any;
  const ctl = new NFTController();
  const result = await ctl.createNFT(contract, nftId, artURI, price, ownerAddr, creatorAddr,properties);
  res.send(result);
};
