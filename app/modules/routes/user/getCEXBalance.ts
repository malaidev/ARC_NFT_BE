import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from "../../controller/DepoUserController";


const getUsdtValue = async  (exchangeName, formatedMarket) => {
  const exchange = new ccxt[exchangeName]();
  const response = await exchange.fetchMarkets();
  const formatedSymbols = formatedMarket.map(quote => `${quote.symbol}/USDT`);
  const allTickers = await exchange.fetchTickers(formatedSymbols);

  Object.keys(allTickers).forEach(base => {
    const exists = formatedMarket.find(item => item.symbol.split('/')[0] === base.split('/')[0]);
    if(exists){
      const lastPrice = allTickers[base].info.lastPrice ? +allTickers[base].info.lastPrice : +allTickers[base].last;
      exists.usdValue = exists.amount * lastPrice;
    }
  })
  return formatedMarket;
}

const getBinanceBalance = async ( userData ) => {
  const exchange = new ccxt.binance();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  await exchange.checkRequiredCredentials() // throw AuthenticationError
  const responseBalance = await exchange.fetchBalance();
  const userSymbols = (Object.keys(responseBalance['total']).filter(item => responseBalance['total'][item] !== 0));
  const responseSymbol = userSymbols.map(symbol => ({
    exchange: 'binance',
    symbol,
    amount: +responseBalance['total'][symbol],
    usdValue: symbol === 'USDT' ? +responseBalance['total'][symbol] : 0,
    availableValue: +responseBalance['free'][symbol]
  }))

  const responseFormated = await getUsdtValue('binance', responseSymbol)
  return responseFormated;
}

const getHuobiBalance = async ( userData ) => {
  const exchange = new ccxt.huobi();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  await exchange.checkRequiredCredentials() // throw AuthenticationError
  const responseBalance = await exchange.fetchBalance();

  const userSymbols = (Object.keys(responseBalance['total']).filter(item => responseBalance['total'][item] !== 0));
  const responseSymbol = userSymbols.map(symbol => ({
    exchange: 'huobi',
    symbol,
    amount: +responseBalance['total'][symbol],
    usdValue: symbol === 'USDT' ? +responseBalance['total'][symbol] : 0,
    availableValue: +responseBalance['free'][symbol]
  }))

  const responseFormated = await getUsdtValue('huobi', responseSymbol)
  return responseFormated;
};

const getFtxBalance = async ( userData ) => {
  const exchange = new ccxt.ftx();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  
  // config for subaccounts 
  // exchange.headers = {
    // 'FTX-SUBACCOUNT': 'depo_test',
  // }

  if(userData.extraFields.length > 0){
    const userSubAccount = userData.extraFields.find(field => field.fieldName === 'Subaccount');
    exchange.headers = {
      'FTX-SUBACCOUNT': userSubAccount.value,
    }
  }
 
  await exchange.checkRequiredCredentials() // throw AuthenticationError
  const responseBalance = await exchange.fetchBalance();

  const responseSymbol = responseBalance.info.result.map(symbol => ({
    exchange: 'ftx',
    symbol: symbol.coin,
    amount: +symbol.total,
    usdValue: +symbol.usdValue,
    availableValue: symbol.free
  }))

  return responseSymbol
};

const getKucoinBalance = async ( userData ) => {
  const exchange = new ccxt.kucoin();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.password = userData.passphrase;
  
  await exchange.checkRequiredCredentials() // throw AuthenticationError
  
  const responseBalance = await exchange.fetchBalance();
  const userSymbols = (Object.keys(responseBalance['total']).filter(item => responseBalance['total'][item] !== 0));
  const responseSymbol = userSymbols.map(symbol => ({
    exchange: 'kucoin',
    symbol,
    amount: +responseBalance['total'][symbol],
    usdValue: symbol === 'USDT' ? +responseBalance['total'][symbol] : 0,
    availableValue: +responseBalance['free'][symbol]
  }))

  const responseFormated = await getUsdtValue('kucoin', responseSymbol)
  // console.log(responseFormated)
  return responseFormated;
}

export const getUserCexBalance = async (req: FastifyRequest, res: FastifyReply) => {
  const { walletId } = req.params as any;

  const userController = new DepoUserController();
  const userExchanges :any = await userController.getUserApiKeys(walletId);

  if(!userExchanges) return res.send({});

  const response = {
    symbols: [],
    uniqueSymbols: [],
    walletValue: 0,
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'binance' )){
    const binanceResponse = await getBinanceBalance(userExchanges.find(exchange => exchange.id.toLowerCase() === 'binance'))

    if(binanceResponse){
      response.symbols.push(...binanceResponse);
    }
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'huobi' )){
    const responseHuobi = await getHuobiBalance(userExchanges.find(exchange => exchange.id.toLowerCase() === 'huobi'))

    if(responseHuobi){
      response.symbols.push(...responseHuobi);
    }
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'ftx' )){
    const responseFTX = await getFtxBalance(userExchanges.find(exchange => exchange.id.toLowerCase() === 'ftx'))

    if(responseFTX){
      response.symbols.push(...responseFTX);
    }
  }

  if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'kucoin' )){
    const responseKucoin = await getKucoinBalance(userExchanges.find(exchange => exchange.id.toLowerCase() === 'kucoin'))

    if(responseKucoin){
      response.symbols.push(...responseKucoin);
    }
  }

  response.symbols.forEach(symbol => {
    response.walletValue += +symbol.usdValue;
    const existIndx = response.uniqueSymbols.findIndex(item => item.symbol === symbol.symbol);
    if(existIndx === -1 ){
      return response.uniqueSymbols.push({...symbol, repeat: +(response.symbols.filter(item => item.symbol === symbol.symbol)).length })
    } else  {
      response.uniqueSymbols[existIndx].amount += +symbol.amount
      response.uniqueSymbols[existIndx].usdValue += +symbol.usdValue
    }
  })

  response.walletValue = +response.walletValue.toFixed(2);
  response.uniqueSymbols.forEach(symbol => symbol.usdValue = symbol.usdValue / symbol.repeat )

  return res.send({ response });
}