import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from "../../controller/DepoUserController";


const loadBinanceOrders = async ( userData ) => {
  const exchange = new ccxt.binance()
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.options["warnOnFetchOpenOrdersWithoutSymbol"] = false;
  await exchange.checkRequiredCredentials() // throw AuthenticationError

  const openOrders = (await exchange.fetchOpenOrders()).map(order => ({...order, exchange: 'binance'}));

  return openOrders;

};

const loadHuobiOrders = async ( userData ) => {
  const exchange = new ccxt.huobi({
    'fetchOpenOrdersMethod': 'fetch_open_orders_v2'
  })
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.options["warnOnFetchOpenOrdersWithoutSymbol"] = false;
  await exchange.checkRequiredCredentials() // throw AuthenticationError
  // const openOrders = (await exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}))
  return;
};

const loadFtxOrders = async ( userData ) => {
  const exchange = new ccxt.ftx();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  
  if(userData.extraFields.length > 0){
    const userSubAccount = userData.extraFields.find(field => field.fieldName === 'Subaccount');
    exchange.headers = {
      'FTX-SUBACCOUNT': userSubAccount.value,
    }
  }

  await exchange.checkRequiredCredentials() // throw AuthenticationError
  const openOrders = (await exchange.fetchOpenOrders()).map(order => ({...order, exchange: 'ftx'}) )
  
  return openOrders
};

export const getUserAllOpenOrders = async (req: FastifyRequest, res: FastifyReply) => {
  const { walletId } = req.params as any;

  const userController = new DepoUserController();
  const userExchanges :any = await userController.getUserApiKeys(walletId);

  const response = []

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'binance' )){
    const binanceResponse = await loadBinanceOrders(userExchanges.find(exchange => exchange.id.toLowerCase() === 'binance'))

    if(response){
      response.push(...binanceResponse);
    }
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'huobi' )){
    const responseHuobi = await loadHuobiOrders(userExchanges.find(exchange => exchange.id.toLowerCase() === 'huobi'))

    // if(responseHuobi){
    //   orders.push(...responseHuobi);
    // }
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'ftx' )){
    const responseFTX = await loadFtxOrders(userExchanges.find(exchange => exchange.id.toLowerCase() === 'ftx'))

    if(responseFTX){
      response.push(...responseFTX);
    }
  }

  return res.send({ response });
}