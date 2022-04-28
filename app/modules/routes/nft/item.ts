import { FastifyReply, FastifyRequest } from "fastify";
import { parse } from "csv-parse";
import fs, { ReadStream } from "fs";

import { NFTController } from "../../controller/NFTController";
import { parseQueryUrl } from "../../util/parse-query-url";

export const getItemDetail = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId, nftId } = req.params as { collectionId: string; nftId: number };
  const ctl = new NFTController();
  const result = await ctl.getItemDetail(collectionId, nftId);
  res.send(result);
};

export const getItemHistory = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId, nftId } = req.params as { collectionId: string; nftId: number };
  const ctl = new NFTController();
  const result = await ctl.getItemHistory(collectionId, nftId);
  res.send(result);
};

export const getItemOffers = async (req: FastifyRequest, res: FastifyReply) => {
  const { collectionId, nftId } = req.params as { collectionId: string; nftId: number };
  const ctl = new NFTController();
  const result = await ctl.getItemOffers(collectionId, nftId);
  res.send(result);
};

export const getAllItems = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;
  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;
  const ctl = new NFTController();
  const result = await ctl.getItems(filters);
  res.send(result);
};

export const getTrendingItems = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split("?")[1];
  const filters = query ? parseQueryUrl(query) : null;
  filters && filters.filters.length == 0 && req.query["filters"]
    ? (filters.filters = JSON.parse(req.query["filters"]))
    : null;
  const ctl = new NFTController();
  const result = await ctl.getTrendingItems(filters);
  res.send(result);
};

export const createItem = async (req, res) => {
  if (req.body && !req.body.artFile) {
    throw new Error("artURI is invalid or missing");
  }
  const user = req["session"] as any;
  let artBody: any = null;
  if (req.body && req.body.artFile && req.body.artFile.value !== "") {
    artBody =
      "data:" +
      req.body.artFile.mimetype +
      ";base64," +
      Buffer.from(await req.body.artFile.toBuffer()).toString("base64"); // access files
  }
  let contentType = req.body.artFile.mimetype.substring(0, req.body.artFile.mimetype.lastIndexOf("/"));
  let mimeType = req.body.artFile.mimetype;
  const body = Object.fromEntries(Object.keys(req.body).map((key) => [key, req.body[key].value]));
  body.artFile = artBody;
  body.artName = req.body.artFile.filename.substring(0, req.body.artFile.filename.lastIndexOf("."));
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
    mimeType,
    user?.walletId.toLowerCase()
  );
  res.send(result);
};

export const bulkUpload = async (req, res) => {
  if (req.body && !req.body.csvFile) {
    throw new Error("CSV is missing");
  }
  const buffer = await req.body.csvFile.toBuffer();
  parse(buffer, { columns: true }, async function (err, records) {
    if (err) {
      return res.send(err);
    }
    const collectionUrl = records[0]["Collection"].replace("/", "");
    const user = req["session"] as any;
    const walletAddress = user.walletId.toLowerCase();
    const ctl = new NFTController();
    const uploadRes = await ctl.bulkUpload(collectionUrl, walletAddress, records);
    return res.send(uploadRes);
  });
};

export const deleteItem = async (req: FastifyRequest, res: FastifyReply) => {
  const { id } = req.params as { id: string };
  const ctl = new NFTController();
  const userSession = req["session"] as any;
  const result = await ctl.deleteItem(id, userSession.walletId.toLowerCase());
  res.send(result);
};

export const updateItem = async (req: FastifyRequest, res: FastifyReply) => {
  const ctl = new NFTController();
  const { nftId } = req.params as any;
  try {
    const result = await ctl.updateNFT(nftId, req.body);
    res.send(result);
  } catch (error) {
    res.code(400).send(error);
  }
};
