
// Routers

import { respond } from "../util/respond";
import { routes } from "./routes";

/**
 * This funciton prepares the routes to be instantiated
 * 
 * @param app fastify instance
 * @returns {Promise<any>} unresolved promise
 */
export async function router(app: any): Promise<any> {

    // Status check route
    app.get('/', function (req, res) {
        const { rnd } = require('./app/modules/util/rnd');
        let rand = Number(((Math.random() * rnd.length) % (Number(rnd.length) - 1)).toFixed(0));
        res.send(respond(rand));
    });

    return Promise.all(routes(app));
}