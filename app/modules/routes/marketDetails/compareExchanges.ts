import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";

const getBinancePrice = async (symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.binance({
    'options': {
      'defaultType': 'spot',   
    }});

  const allMarkets = await exchange.loadMarkets();
 
  if(allMarkets[symbol]){
    const { ask: price, info:{ volume }} = await exchange.fetchTicker(symbol);
    const { maker, taker } = allMarkets[symbol];
    
    return {
      exchange: 'Binance',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume
    }
  }
  return {
    exchange: 'Binance',
    exchangePrice: 0,
    feePercent: 0,
    feeBase: 0,
    totalPrice: 0,
    volume: 0
  }
}

const getHuobiPrice = async (symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.huobi({
    'options': {
      'defaultType': 'spot',   
    }});
  const allMarkets = await exchange.loadMarkets();

  if(allMarkets[symbol]){
    const { ask: price, info:{ vol }} = await exchange.fetchTicker(symbol);
    const { maker, taker } = allMarkets[symbol];

    return {
      exchange: 'Huobi',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume: vol
    }
  }
  return {
    exchange: 'Huobi',
    exchangePrice: 0,
    feePercent: 0,
    feeBase: 0,
    totalPrice: 0,
    volume: 0
  }
}


const getFTXPrice = async (symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.ftx({
    'options': {
      'defaultType': 'spot',   
    }});
  const allMarkets = await exchange.loadMarkets();

  if(allMarkets[symbol]){
    const { ask: price, info:{ quoteVolume24h }} = await exchange.fetchTicker(symbol);
    const { maker, taker } = allMarkets[symbol];

    return {
      exchange: 'FTX',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume: quoteVolume24h
    }
  }
  return {
    exchange: 'FTX',
    exchangePrice: 0,
    feePercent: 0,
    feeBase: 0,
    totalPrice: 0,
    volume: 0
  }
}



export const compareExchangesOperation = async (req: FastifyRequest, res: FastifyReply) => {
  const { symbol, userPriceUnit, userSize, type } = req.body as any;

  const binanceResponse = await getBinancePrice(symbol, type, userPriceUnit, userSize);
  const huobiResponse = await getHuobiPrice(symbol, type, userPriceUnit, userSize);
  const ftxResponse = await getFTXPrice(symbol, type, userPriceUnit, userSize);

  // return res.send(binanceResponse);
  return res.send({type: type, quote: symbol.split('/')[1], compare:  [binanceResponse, huobiResponse, ftxResponse]});
}