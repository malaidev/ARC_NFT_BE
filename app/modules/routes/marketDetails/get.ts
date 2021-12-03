import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from '../../controller/DepoUserController';
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
  
  let allExchanges = ['binance', 'huobi', 'ftx'];
  const { symbol, walletId } = req.params as any;
  // let kucoinExchange;

  // if(walletId) {
  //   const userController = new DepoUserController();
  //   const userExchanges :any = await userController.getUserApiKeys(walletId.toLowerCase());

  //   kucoinExchange = userExchanges.find(exchange => exchange.id.toLowerCase() === 'kucoin');
  //   allExchanges.push('kucoin')
  // }


  const formattedSymbol = symbol.replace('-', '/');
  let allExchangesOrderBook = [];
  
  if (symbol) {
    try {
      for (const exchangeName of allExchanges) {
        const exchange = new ccxt[exchangeName]();

        // if(exchangeName === 'kucoin'){
        //   exchange.apiKey = kucoinExchange.apiKey;
        //   exchange.secret = kucoinExchange.apiSecret;
        //   exchange.password = kucoinExchange.passphrase;
        //   await exchange.checkRequiredCredentials() // throw AuthenticationError
        // }

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

    return res.send({ 
      allExchangesOrderBook
    })
  } else {
    res.code(400).send(respond("Symbol cannot be null.", true, 400));
  }
}
