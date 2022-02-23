import { user } from './user';
import { log } from './logger';
import { marketOverview } from './marketOverview';
import { marketDetails } from './marketDetails';
import { symbolPrice } from './symbolPrice';
import { tokenPrice } from './tokenPrice';
import { userOrderBook } from './orderBook';
import { market } from './market';
import { order } from './order';
import { emailContact } from './emailContact';
import { pool } from './pool';
import { contract } from './contract';
import { test } from './test/index';
/**
 * Creates the array of routes to be set up.
 *
 * @param app fastify instance
 * @returns {array<Promise>} array of promises
 */
export function routes(app: any): Array<Promise<any>> {
  // Register routes here
  return [
    app.register(log, { prefix: 'ws/v2/log' }),
    app.register(user, { prefix: 'ws/v2/user' }),
    app.register(marketOverview, { prefix: 'ws/v2/mktOverview' }),
    app.register(marketDetails, { prefix: 'ws/v2/marketDetails' }),
    app.register(userOrderBook, { prefix: 'ws/v2/ordersBook' }),
    app.register(order, { prefix: 'ws/v2/order' }),
    app.register(market, { prefix: 'ws/v2/market' }),
    app.register(symbolPrice, { prefix: 'ws/v2/symbolPrice' }),
    app.register(tokenPrice, { prefix: 'ws/v2/tokenPrice' }),
    app.register(emailContact, { prefix: 'ws/v2/emailContact' }),
    app.register(pool, { prefix: 'ws/v2/pool' }),
    app.register(contract, { prefix: 'ws/v2/sign' }),
    app.register(test, { prefix: 'ws/v2/test'})
  ];
}
