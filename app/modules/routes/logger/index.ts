import {get} from './get'
import {clear} from './clear'
import { config } from "../../../config/config";
/**
 * Exports the log routes
 * @param {*} router 
 * @param {*} options 
 */
export const log = async (router, options) => {
    router.get('/', config.route("jwt"), get);
    router.delete('/',config.route("jwt"), clear);
}