import { FastifyReply, FastifyRequest } from "fastify";
import { NFTCollectionController } from "../../controller/NFTCollectionController";
import { uploadImageBase64 } from "../../util/morailsHelper";
import { parseQueryUrl } from "../../util/parse-query-url";

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
  const query = req.url.split("?")[1];
  const filters=query?parseQueryUrl(query):null;
  filters && filters.filters.length==0 && req.query['filters']?filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getCollections(filters);
  res.send(result);
};

export const getTopCollections = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters=query?parseQueryUrl(query):null;
  filters && filters.filters.length==0 && req.query['filters']?filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getTopCollections(filters);
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
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  const contract = req.params['contract'] as any;
  filters.filters.length == 0 && req.query['filters'] ? filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getItems(contract,filters);
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
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query['filters'] ? filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getHistory(contract,filters);
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
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query['filters'] ? filters.filters = JSON.parse(req.query['filters']) : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getActivity(contract,filters);
  res.send(result);
};

/**
 * Create new collection - save to MongoDB
 * Method: POST
 * 
 * @param req 
  "logoFile": "file", 
  "featuredImgFile": "file",
  "bannerImgFile": "file",
  "name": "string",
  "url": "string",
  "description": "string",
  "category": "string",
  "siteUrl": "string",
  "discordUrl": "string",
  "instagramUrl": "string",
  "mediumUrl": "string",
  "telegramUrl": "string",
  "creatorEarnings": "number",
  "blockchain": "string",     (ERC721 | ERC1155)
  "isExplicit": "boolean",
  "creatorId": "string", (owner Id in mongodb)
 *    
 * @param res 
 *    result of creation
 *      success:  201
 *      fail:     501
 */
export const createCollection = async (req,res) => {


  
  if (req.body && !req.body.logoFile) {
    throw new Error("logoUrl is invalid or missing");
  }
  
  let logoBody:any=null;
  let featuredImgBody:any=null;
  let bannerImgBody:any=null;

  if (req.body && req.body.logoFile){
    logoBody = "data:" + req.body.logoFile.mimetype+ ";base64,"+ Buffer.from(await req.body.logoFile.toBuffer()).toString('base64') // access files
  };

  if (req.body && req.body.featuredImgFile){
    featuredImgBody = "data:" + req.body.featuredImgFile.mimetype+ ";base64,"+ Buffer.from(await req.body.featuredImgFile.toBuffer()).toString('base64') // access files
 };
 if (req.body && req.body.bannerImgFile){
  bannerImgBody = "data:" + req.body.bannerImgFile.mimetype+ ";base64,"+ Buffer.from(await req.body.bannerImgFile.toBuffer()).toString('base64') // access files
};

const body = Object.fromEntries(
  Object.keys(req.body).map((key) => [key, req.body[key].value])
);

const logoFile =logoBody?await uploadImageBase64({name:req.body.logoFile.filename.substring(0, req.body.logoFile.filename.lastIndexOf(".")),img:logoBody}):'';
const featuredImgFile = featuredImgBody? await uploadImageBase64({name:req.body.featuredImgFile.filename.substring(0, req.body.featuredImgFile.filename.lastIndexOf(".")),img:featuredImgBody}):'';
const bannerImgFile = bannerImgBody?await uploadImageBase64({name:req.body.bannerImgFile.filename.substring(0, req.body.bannerImgFile.filename.lastIndexOf(".")),img:bannerImgBody}):'';

body.logoFile=logoFile;
body.featuredImgFile=featuredImgFile;
body.bannerImgFile=bannerImgFile;



console.log(body);

const ctl = new NFTCollectionController();
  const result = await ctl.createCollection(body.logoFile, body.featuredImgFile, body.bannerImgFile, body.name, body.description, body.category,
  body.siteUrl, body.discordUrl, body.instagramUrl, body.mediumUrl, body.telegramUrl, 
  body.creatorEarning, body.blockchain, body.isExplicit, body.creatorId);
  res.send(result);


 


  // const { logoFile, featuredImgFile, bannerImgFile, name, description, category,
  //   siteUrl, discordUrl, instagramUrl, mediumUrl, telegramUrl, 
  //   creatorEarning, blockchain, isExplicit, creatorId } = req.body as any;
  // const ctl = new NFTCollectionController();
  // const result = await ctl.createCollection(logoFile, featuredImgFile, bannerImgFile, name, description, category,
  //   siteUrl, discordUrl, instagramUrl, mediumUrl, telegramUrl, 
  //   creatorEarning, blockchain, isExplicit, creatorId);
  // res.send(result);
}

export const getCollectionDetail =async (req:FastifyRequest, res: FastifyReply) => {
  const {contract} = req.params as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getCollectionDetail(contract);
  res.send(result);
}
