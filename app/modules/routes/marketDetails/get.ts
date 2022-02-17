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
  
  let allExchanges = ['gateio', 'binance', 'huobi', 'ftx', 'kucoin'];
  const { marketType, symbol } = req.params as any;

  let allExchangesOrderBook = [];
  
  if (symbol) {
    try {
      for (const exchangeName of allExchanges) {
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
        const realSymbol = markets[symbol] ? symbol : markets[formattedSymbol] ? formattedSymbol : undefined

        if (realSymbol) {
          const response = await exchange.fetchOrderBook(realSymbol);
          const precision = {amount: 4 , base: 8 , price: 6 , quote: 8};
          allExchangesOrderBook.push({exchangeName: exchange.name, orderBook: response ? response : {}, precision});
        }
      }
    } catch (error) {
      console.log(error);
    }

    if(allExchangesOrderBook.find(order => order.exchangeName === 'KuCoin')){
      allExchangesOrderBook.find(order => order.exchangeName === 'KuCoin').orderBook.asks = (allExchangesOrderBook.find(order => order.exchangeName === 'KuCoin').orderBook.asks).slice(0,10);
      allExchangesOrderBook.find(order => order.exchangeName === 'KuCoin').orderBook.bids = (allExchangesOrderBook.find(order => order.exchangeName === 'KuCoin').orderBook.bids).slice(0,10);
    }
    
    return res.send({ 
      allExchangesOrderBook
    })
  } else {
    res.code(400).send(respond("Symbol cannot be null.", true, 400));
  }
}
