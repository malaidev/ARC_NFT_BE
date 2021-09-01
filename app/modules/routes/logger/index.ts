import {get} from './get'
import {clear} from './clear'

/**
 * Exports the log routes
 * @param {*} router 
 * @param {*} options 
 */
export const log = async (router, options) => {
    router.get('/', get);
    router.delete('/', clear);
}