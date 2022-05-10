import { FastifyReply, FastifyRequest } from "fastify";
import { NFTCollectionController } from "../../controller/NFTCollectionController";
import { uploadImageBase64 } from "../../util/morailsHelper";
import { parseQueryUrl } from "../../util/parse-query-url";
export const getCollectionsItems = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;
  const keyword = req.query["keyword"] as string;
  const ctl = new NFTCollectionController();
  const result = await ctl.searchCollectionsItems(keyword, filters);
  res.send(result);
};
export const getCollections = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;
  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getCollections(filters);
  res.send(result);
};

export const getCollectionOffer = async (req: FastifyRequest, res: FastifyReply) => {
  const collectionId = req.params["collectionId"] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getCollectionOffer(collectionId);
  res.send(result);
};

export const getTopCollections = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;
  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getTopCollections(filters);
  res.send(result);
};

export const getHotCollections = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;
  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getHotCollections(filters);
  res.send(result);
};

export const getTagCollections = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;

  const { tag } = req.params as any;

  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getTagCollections(tag,filters);
  res.send(result);
};


export const getItems = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  const collectionId = req.params["collectionId"] as any;
  filters.filters.length == 0 && req.query["filters"] ? (filters.filters = JSON.parse(req.query["filters"])) : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getItems(collectionId, filters);
  res.send(result);
};
export const deleteCollection = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId } = req.params as any;
  const ctl = new NFTCollectionController();
  const userSession = req["session"] as any;
  const result = await ctl.deleteCollection(collectionId, userSession.walletId.toLowerCase());
  res.send(result);
};
export const getOwners = async (req: FastifyRequest, res: FastifyReply) => {
  const collectionId = req.params["collectionId"] as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getOwners(collectionId);
  res.send(result);
};
export const getHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const collectionId = req.params["collectionId"] as any;
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query["filters"] ? (filters.filters = JSON.parse(req.query["filters"])) : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getHistory(collectionId, filters);
  res.send(result);
};
export const getActivities = async (req: FastifyRequest, res: FastifyReply) => {
  const collectionId = req.params["collectionId"] as any;
  const query = req.url.split("?")[1];
  const filters = parseQueryUrl(query);
  filters.filters.length == 0 && req.query["filters"] ? (filters.filters = JSON.parse(req.query["filters"])) : null;
  const ctl = new NFTCollectionController();
  const result = await ctl.getActivity(collectionId, filters);
  res.send(result);
};

export const updateCollection = async (req, res) => {
  let logoBody: any = null;
  let featuredImgBody: any = null;
  let bannerImgBody: any = null;
  let logoMimetype: any = null;
  let featuredMimetype: any = null;
  let bannerMimetype: any = null;
  const { collectionId } = req.params as any;

  const body = Object.fromEntries(Object.keys(req.body).map((key) => [key, req.body[key].value]));

  if (req.body && req.body.logoFile && req.body.logoFile.value !== "") {
    //  logoBody=await  req.body.logoFile.toBuffer();
    logoMimetype = req.body.logoFile.mimetype;
    logoBody =
      "data:" +
      req.body.logoFile.mimetype +
      ";base64," +
      Buffer.from(await req.body.logoFile.toBuffer()).toString("base64"); // access files
    body.logoFile = logoBody;
    body.logoName = logoBody
      ? req.body.logoFile.filename.substring(0, req.body.logoFile.filename.lastIndexOf("."))
      : "";
  }
  if (req.body && req.body.featuredImgFile && req.body.featuredImgFile.value !== "") {
    //  featuredImgBody= await req.body.featuredImgFile.toBuffer();
    featuredMimetype = req.body.featuredImgFile.mimetype;
    featuredImgBody =
      "data:" +
      req.body.featuredImgFile.mimetype +
      ";base64," +
      Buffer.from(await req.body.featuredImgFile.toBuffer()).toString("base64"); // access files
    body.featuredImgFile = featuredImgBody;
    body.featureName = featuredImgBody
      ? req.body.featuredImgFile.filename.substring(0, req.body.featuredImgFile.filename.lastIndexOf("."))
      : "";
  }
  if (req.body && req.body.bannerImgFile && req.body.bannerImgFile.value !== "") {
    // bannerImgBody= await req.body.bannerImgFile.toBuffer();
    bannerMimetype = req.body.bannerImgFile.mimetype;
    bannerImgBody =
      "data:" +
      req.body.bannerImgFile.mimetype +
      ";base64," +
      Buffer.from(await req.body.bannerImgFile.toBuffer()).toString("base64"); // access files
    body.bannerImgFile = bannerImgBody;
    body.bannerName = bannerImgBody
      ? req.body.bannerImgFile.filename.substring(0, req.body.bannerImgFile.filename.lastIndexOf("."))
      : "";
  }

  const ctl = new NFTCollectionController();
  const result = await ctl.updateCollection(
    collectionId,
    body.logoFile || null,
    body.featuredImgFile || null,
    body.bannerImgFile || null,
    body.name,
    body.url,
    body.description,
    body.category,
    body.siteUrl,
    body.discordUrl,
    body.instagramUrl,
    body.mediumUrl,
    body.twitterUrl,
    body.telegramUrl,
    body.creatorEarning,
    body.blockchain,
    body.isExplicit,
    body.creatorId,
    body.logoName,
    body.featureName,
    body.bannerName,
    body.properties,
    logoMimetype,
    featuredMimetype,
    bannerMimetype
  );
  res.send(result);
};
export const createCollection = async (req, res) => {
  if (req.body && !req.body.logoFile) {
    throw new Error("logoUrl is invalid or missing");
  }
  let logoBody: any = null;
  let featuredImgBody: any = null;
  let bannerImgBody: any = null;
  let logoMimetype: any = null;
  let featuredMimetype: any = null;
  let bannerMimetype: any = null;
  if (req.body && req.body.logoFile && req.body.logoFile.value !== "") {
    //  logoBody=await  req.body.logoFile.toBuffer();
    logoMimetype = req.body.logoFile.mimetype;
    logoBody =
      "data:" +
      req.body.logoFile.mimetype +
      ";base64," +
      Buffer.from(await req.body.logoFile.toBuffer()).toString("base64"); // access files
  }
  if (req.body && req.body.featuredImgFile && req.body.featuredImgFile.value !== "") {
    //  featuredImgBody= await req.body.featuredImgFile.toBuffer();
    featuredMimetype = req.body.featuredImgFile.mimetype;
    featuredImgBody =
      "data:" +
      req.body.featuredImgFile.mimetype +
      ";base64," +
      Buffer.from(await req.body.featuredImgFile.toBuffer()).toString("base64"); // access files
  }
  if (req.body && req.body.bannerImgFile && req.body.bannerImgFile.value !== "") {
    // bannerImgBody= await req.body.bannerImgFile.toBuffer();
    bannerMimetype = req.body.bannerImgFile.mimetype;
    bannerImgBody =
      "data:" +
      req.body.bannerImgFile.mimetype +
      ";base64," +
      Buffer.from(await req.body.bannerImgFile.toBuffer()).toString("base64"); // access files
  }
  const body = Object.fromEntries(Object.keys(req.body).map((key) => [key, req.body[key].value]));
  body.logoFile = logoBody;
  body.logoMimetype = logoMimetype;
  body.featuredImgFile = featuredImgBody;
  body.featuredMimetype = featuredMimetype;
  body.bannerImgFile = bannerImgBody;
  body.bannerMimetype = bannerMimetype;
  body.logoName = logoBody ? req.body.logoFile.filename.substring(0, req.body.logoFile.filename.lastIndexOf(".")) : "";
  body.featureName = featuredImgBody
    ? req.body.featuredImgFile.filename.substring(0, req.body.featuredImgFile.filename.lastIndexOf("."))
    : "";
  body.bannerName = bannerImgBody
    ? req.body.bannerImgFile.filename.substring(0, req.body.bannerImgFile.filename.lastIndexOf("."))
    : "";
  const ctl = new NFTCollectionController();
  const result = await ctl.createCollection(body);
  res.send(result);
};
export const getCollectionDetail = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId } = req.params as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getCollectionDetail(collectionId);
  res.send(result);
};
export const getCollectionByUrl = async (req: FastifyRequest, res: FastifyReply) => {
  const { url } = req.params as any;
  const ctl = new NFTCollectionController();
  const result = await ctl.getCollectionByUrl(url);
  res.send(result);
};
