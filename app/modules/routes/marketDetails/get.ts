import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { respond } from "../../util/respond";

const dotenv = require("dotenv");
dotenv.config();
// process.env["MONGODB_USER"],

export const loadMarketDetails = async (req: FastifyRequest, res: FastifyReply) => {

  const { exchangeName, symbol } = req.params as any;

  const formattedExchangeName = exchangeName.toLowerCase();
  const formattedSymbol = symbol.replace('-', '/');

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const exchange = new ccxt[formattedExchangeName]();
      const response = await exchange.fetchOrderBook(formattedSymbol);
      if (!response) {
        res.code(204).send();
      } else {
        return res.send({ response });
      }
    } catch(error) {
      console.log(error);
    }
  } else {
    res.code(400).send(respond("`Exchange name cannot be null.`", true, 400));
  }
}

export const loadAllExchangesOrderBook = async(req: FastifyRequest, res: FastifyReply) => {
  
  let allExchanges = ['binance', 'huobi', 'ftx', 'kucoin'];
  const { symbol } = req.params as any;

  const formattedSymbol = symbol.replace('-', '/');
  let allExchangesOrderBook = [];
  
  if (symbol) {
    try {
      for (const exchangeName of allExchanges) {
        const exchange = new ccxt[exchangeName]();

        if(exchangeName === 'kucoin'){
          exchange.apiKey = process.env["KUCOIN_SERVICE_API_KEY"];
          exchange.secret = process.env["KUCOIN_SERVICE_SECRET"];
          exchange.password = process.env["KUCOIN_SERVICE_PASSPHRASE"];
          await exchange.checkRequiredCredentials() // throw AuthenticationError
        }

        const markets = await exchange.loadMarkets();
        if (markets[formattedSymbol]) {
          const response = await exchange.fetchOrderBook(formattedSymbol);
          const precision = {amount: 4 , base: 8 , price: 6 , quote: 8};
          allExchangesOrderBook.push({exchangeName: exchange.name, orderBook: response, precision});
        }
      }
    } catch (error) {
      console.log(error);
    }

    allExchangesOrderBook.find(order => order.exchangeName === 'KuCoin').orderBook.asks = (allExchangesOrderBook.find(order => order.exchangeName === 'KuCoin').orderBook.asks).slice(0,10);
    
    return res.send({ 
      allExchangesOrderBook
    })
  } else {
    res.code(400).send(respond("Symbol cannot be null.", true, 400));
  }
}
