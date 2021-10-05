import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { respond } from "../../util/respond";

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
  const allExchanges = ['binance', 'huobi', 'ftx'];
  const { symbol } = req.params as any;
  const formattedSymbol = symbol.replace('-', '/');
  let allExchangesOrderBook = [];



  if (symbol) {
    try {
      for (const exchangeName of allExchanges) {
        const exchange = new ccxt[exchangeName]();
        const response = await exchange.fetchOrderBook(formattedSymbol);
        allExchangesOrderBook.push({exchangeName: exchange.name, response});
      }
    } catch (error) {
      console.log(error);
    }

    return res.send({ 
      allExchangesOrderBook
    })
  } else {
    res.code(400).send(respond("Symbol cannot be null.", true, 400));
  }
}
