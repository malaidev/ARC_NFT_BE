import { config } from "../../../config/config";
import { getTokenURI } from "./getTokenUri";


export const tokenUri = async (router: any, options: any) => {
    router.get("/nft/:contract/:nftId",config.routeParamsValidation(), getTokenURI);
}