import { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../../../config/config";
import { NFTCollectionController } from "../../controller/NFTCollectionController";
import { NFTController } from "../../controller/NFTController";
import { parseQueryUrl } from "../../util/parse-query-url";

export const getTokenURI = async (req: FastifyRequest, res: FastifyReply) => {
    const { contract, nftId } = req.params as { contract: string; nftId: number };
    const ctl = new NFTController();

    const result = await ctl.getItemSimple(contract,nftId);
    res.send(result);
  };
