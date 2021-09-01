import { Logger } from "../services/Logger";

/**
 * Standarizes a try catch statement
 * @param {Object} object 
 * @param {string} f function name
 * @param {*} opt 
 */
export const tryCatch = async (object: any, f: string, opt?: any) => {
    if (!object[f] || typeof object[f] !== 'function') throw `Name "function ${f}" is not a function.`;

    try {
        if (opt && opt.length > 0)
            return opt ? await object[f](...opt) : object[f]();
        return opt ? await object[f]({ ...opt }) : object[f]();
    } catch (error) {
        if (opt.transaction) opt.transaction.rollback();
        const log = new Logger('error', '', error.message || error.response || error);
        log.save();
        return null
    }
}