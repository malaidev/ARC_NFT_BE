import {
  create,
  getAll,
  getOne,
  findOrCreateUser,
  update,
  removeApiKey,
  getSingingMessage,
  twoFAGenerate,
  turnOn,
} from "./user";
import { getUserCexBalance } from "./getCEXBalance";
import { getUserAllOpenOrders } from "./getAllOpenOrders";
import { config } from "../../../config/config";

/**
 * Exports the users actions routes.
 * @param {*} router
 * @param {*} options
 */
export const user = async (router: any, options: any) => {
  router.get("/", config.route("jwt"), getAll);
  router.get("/:walletId", config.route("jwt"), getOne);
  router.get("/:walletId/auth-message", getSingingMessage);
  router.post("/auth", findOrCreateUser);
  router.get("/auth", config.route("jwt"), (req, res) => {res.code(204).send();});
  router.post("/", config.route("jwt"), create);
  router.put("/:walletId", config.route("jwt"), update);
  router.delete("/:walletId/:exchangeId/:apiKey",config.route("jwt"),removeApiKey);

  // get cex user balance
  router.get("/cexBalance/:walletId/:marketType",config.route("jwt"),getUserCexBalance);
  router.get("/cexOpenOrders/:walletId",config.route("jwt"),getUserAllOpenOrders);

  /** 2fa */

router.post("/tfa/generate",config.route("jwt"),twoFAGenerate)
router.post("/tfa/activate",config.route("jwt"),turnOn)
/** */

};

