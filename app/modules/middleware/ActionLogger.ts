import { Logger } from "../services/Logger"


/**
 * Logs every action performed in a route.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} done 
 */
export const ActionLogger = (req, res, done) => {
  const log = new Logger('action', req.context.url)
  log.setData({
    request: req.context.config,
  })
  log.save();
  done();
}