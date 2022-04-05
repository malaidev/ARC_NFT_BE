import { FastifyReply, FastifyRequest } from "fastify";
import { NFTController } from "../../controller/NFTController";
import { parseQueryUrl } from "../../util/parse-query-url";
import { uploadImageBase64 } from "../../util/morailsHelper";





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
  "artFile": "string" - ipfs url of image
  "name": "string",
  "externalLink": "string",
  "description": "string",
  "collectionId": "string", (collection id in mongodb)
  "properties": "object",
  "unlockableContent": "string",
  "isExplicit": "boolean",
  "tokenType": "string",
  "contentType": "string" (Image, Music, Video, Other)
 * @param {*} res
 *    success:  201
 *    failure:  501 (cannot find collection)
 *              422 (cannot find owner and creator)
 */
export const createItem = async (req, res) => {
  if (req.body && !req.body.artFile) {
    throw new Error("artURI is invalid or missing");
  }

  const user = req['session'] as any;
  let artBody:any=null;
  
  if (req.body && req.body.artFile && req.body.artFile.value!==''){
    artBody = "data:" + req.body.artFile.mimetype+ ";base64,"+ Buffer.from(await req.body.artFile.toBuffer()).toString('base64') // access files
  };


  // console.log(req.body.artFile.mimetype.substring(0,req.body.artFile.mimetype.lastIndexOf("/")));

  let contentType=req.body.artFile.mimetype.substring(0,req.body.artFile.mimetype.lastIndexOf("/"));

  

  const body = Object.fromEntries(
    Object.keys(req.body).map((key) => [key, req.body[key].value])
  );

  // const artFile =artBody?await uploadImageBase64({name:req.body.artFile.filename.substring(0, req.body.artFile.filename.lastIndexOf(".")),img:artBody}):'';
  


  body.artFile= artBody;
  body.artName= req.body.artFile.filename.substring(0, req.body.artFile.filename.lastIndexOf("."));
  
  
  const ctl = new NFTController();
  const result = await ctl.createNFT(
    body.artFile, 
    body.name,
    body.externalLink, 
    body.description, 
    body.collectionId, 
    body.properties,
    body.unlockableContent,
    body.isExplicit,
    body.tokenType,
    body.artName,
    contentType,
    user?.walletId.toLowerCase()


  );
  res.send(result);
};
