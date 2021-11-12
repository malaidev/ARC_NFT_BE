import { config } from "../../config/config";
import { LogController } from "../controller/LogController";

/**
 * Standarizes a try catch statement
 * @param {Object} object
 * @param {string} f function name
 * @param {*} opt
 */
export const tryCatch = async (object: any, f: string, opt?: any) => {
  if (!object[f] || typeof object[f] !== "function")
    throw `Name "function ${f}" is not a function.`;

  try {
    if (opt && opt.length > 0)
      return opt ? await object[f](...opt) : object[f]();
    return opt ? await object[f]({ ...opt }) : object[f]();
  } catch (error) {
    if (opt.transaction) opt.transaction.rollback();
    if (config.logging) {
      config.__logPool.push({
        type: "TRANSACTION_ERROR",
        error: error.message || error.response,
        ...error,
      });
    }
    return null;
  }
};
