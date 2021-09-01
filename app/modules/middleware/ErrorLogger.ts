import { Logger } from "../services/Logger"

/**
 * Logs errors thrown in a request
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} error 
 * @param {*} done 
 */
export const ErrorLogger = (req, res, error, done) => {
  const log = new Logger('error', req.context.config.url)
  log.setData({
    request: {
      body: req.body,
      params: req.params,
      context: req.context.config
    },
    error: error.message,
  });
  log.save();
  done();
}