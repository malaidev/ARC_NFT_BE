import { user } from "./user";
import { log } from "./logger";
import { marketOverview } from "./marketOverview";
import { marketDetails } from "./marketDetails";
import { userOrderBook } from "./orderBook";
import { market } from "./market";
import { order } from "./order";
import { emailContact } from "./emailContact";

/**
 * Creates the array of routes to be set up.
 *
 * @param app fastify instance
 * @returns {array<Promise>} array of promises
 */
export function routes(app: any): Array<Promise<any>> {
  // Register routes here
  return [
    app.register(log, { prefix: "ws/v2/log" }),
    app.register(user, { prefix: "ws/v2/user" }),
    app.register(marketOverview, { prefix: "ws/v2/mktOverview" }),
    app.register(marketDetails, { prefix: "ws/v2/marketDetails" }),
    app.register(userOrderBook, { prefix: "ws/v2/ordersBook" }),
    app.register(order, { prefix: "ws/v2/order" }),
    app.register(market, { prefix: "ws/v2/market" }),
    app.register(emailContact, { prefix: "ws/v2/emailContact" }),
  ];
}

