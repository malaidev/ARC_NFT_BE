import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { respond } from "../../util/respond";

export const getMarketBySymbol = async (req: FastifyRequest, res: FastifyReply) => {
  const { exchangeName, symbol } = req.params as any;
  const formattedExchangeName = exchangeName.toLowerCase();
  const formattedSymbol = symbol.replace('-', '/');

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const exchange = new ccxt[formattedExchangeName]();
      await exchange.loadMarkets();
      const market = await exchange.market(formattedSymbol);
      if (!market) {
        res.code(204).send();
      } else {
        return res.send({ market });
      }
    } catch(error) {
      console.log(error);
    }
  } else {
    res.code(400).send(respond("`Exchange name cannot be null.`", true, 400));
  }
}

export const getAllMarketsBySymbol = async(req: FastifyRequest, res: FastifyReply) => {
  const allExchanges = ['gateio', 'binance', 'huobi', 'ftx', 'kucoin'];
  const { symbol, marketType } = req.params as any;
  let allExchangesMarkets = [];

  if (symbol) {
    try {
      for (const exchangeName of allExchanges ) {
        const exchange = new ccxt[exchangeName]();
        exchange.options.defaultType = exchangeName === 'gateio' && marketType === 'future' ? 'swap' : marketType;

        if(exchangeName === 'kucoin'){
          exchange.apiKey = process.env["KUCOIN_SERVICE_API_KEY"];
          exchange.secret = process.env["KUCOIN_SERVICE_SECRET"];
          exchange.password = process.env["KUCOIN_SERVICE_PASSPHRASE"];
          await exchange.checkRequiredCredentials() // throw AuthenticationError
        }

        const markets = await exchange.loadMarkets();
        let formattedSymbol = symbol.replace('-', '/');
        if (exchangeName === 'gateio' && marketType === 'future') {
          formattedSymbol = `${formattedSymbol}:${formattedSymbol.split('/')[1]}`;
        }
        if (markets[formattedSymbol]) {
          const response = await exchange.market(formattedSymbol);
          allExchangesMarkets.push({ exchange: exchangeName, market: response })
        }
      }
    } catch (error) {
      console.log(error);
    }

    return res.send({ 
      allExchangesMarkets
    })
  } else {
    res.code(400).send(respond("Symbol cannot be null.", true, 400));
  }
}
