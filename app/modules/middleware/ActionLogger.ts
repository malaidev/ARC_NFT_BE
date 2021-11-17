import { config } from "../../config/config";

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
