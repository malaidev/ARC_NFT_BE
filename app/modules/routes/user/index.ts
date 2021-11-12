import {
  create,
  getAll,
  getOne,
  findOrCreateUser,
  update,
  removeApiKey,
  getSingingMessage,
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
  router.get("/", getAll);
  router.get("/:walletId", getOne);
  router.get("/:walletId/auth-message", getSingingMessage);
  router.post("/auth", findOrCreateUser);
  router.get("/auth", config.route("jwt"), (req, res) => {
    res.code(204).send();
  });
  router.post("/", create);
  router.put("/:walletId", update);
  router.delete("/:walletId/:exchangeId/:apiKey", removeApiKey);

  // get cex user balance
  router.get("/cexBalance/:walletId", getUserCexBalance);
  router.get("/cexOpenOrders/:walletId", getUserAllOpenOrders);
};
