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
  app.get("/", function (req, res) {
    res.code(204).send();
  });

  return Promise.all(routes(app));
}
