import { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../../../config/config";
import { NFTCollectionController } from "../../controller/NFTCollectionController";
import { NFTController } from "../../controller/NFTController";
import { parseQueryUrl } from "../../util/parse-query-url";

export const getTokenURI = async (req,res) => {
    const { contract, nftId } = req.params as { contract: string; nftId: number };
    const ctl = new NFTController();
 
    
    const result = await ctl.getItemSimple(contract,nftId);
    return result;
    // const axios = require('axios').default;
    // const uri = result['image'];
    // axios.get(uri, { responseType: 'stream' })
    // .then(response => {
    //     res.type(response.headers['content-type']).send(response.data);
    // })
    // .catch(function (error) {
    //     res.send(error)
    // })
   



  };
