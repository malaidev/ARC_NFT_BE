import { config } from "../../config/config";
import { LogController } from "../controller/LogController";
import { Logger } from "../services/Logger";

/**
 * Logs every action performed in a route.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} done
 */
export const ActionLogger = (req, res, done) => {
  if (config.logging) {
    config.__logPool.push({
      type: "ACTION_LOGGER",
      request: {
        body: req.body,
        params: req.params,
        context: req.context.config,
        session: req.session,
      },
    });
    done();
  }
};
