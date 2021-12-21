import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";

const getBinancePrice = async (marketType: string, symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.binance();
  exchange.options.defaultType = marketType;
  const allMarkets = await exchange.loadMarkets();

  const formattedSymbol = symbol.replace('-', '/');
  const realSymbol = allMarkets[symbol] ? symbol : allMarkets[formattedSymbol] ? formattedSymbol : undefined

  if(realSymbol){
    const { ask: price, info:{ volume }} = await exchange.fetchTicker(symbol);
    const { maker, taker } = allMarkets[realSymbol];
    
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

const getHuobiPrice = async (marketType: string, symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.huobi();
  exchange.options.defaultType = marketType;
  const allMarkets = await exchange.loadMarkets();

  const formattedSymbol = symbol.replace('-', '/');
  const realSymbol = allMarkets[symbol] ? symbol : allMarkets[formattedSymbol] ? formattedSymbol : undefined


  if(realSymbol){
    const { ask: price, info:{ vol }} = await exchange.fetchTicker(symbol);
    const { maker, taker } = allMarkets[realSymbol];

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


const getFTXPrice = async (marketType: string, symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.ftx();
  exchange.options.defaultType = marketType;
  const allMarkets = await exchange.loadMarkets();

  const formattedSymbol = symbol.replace('-', '/');
  const realSymbol = allMarkets[symbol] ? symbol : allMarkets[formattedSymbol] ? formattedSymbol : undefined

  console.log(symbol)
  console.log(formattedSymbol)
  console.log('REAL SYMBOL AT FTX: ', realSymbol)

  if(realSymbol){
    const { ask: price, info:{ quoteVolume24h }} = await exchange.fetchTicker(symbol);
    const { maker, taker } = allMarkets[realSymbol];
    console.log('maker and taker: ', maker, taker)

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

const getKucoinPrice = async (marketType: string, symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.kucoin();
  exchange.options.defaultType = marketType;
  const allMarkets = await exchange.loadMarkets();
 
  const formattedSymbol = symbol.replace('-', '/');
  const realSymbol = allMarkets[symbol] ? symbol : allMarkets[formattedSymbol] ? formattedSymbol : undefined

  if(realSymbol){
    const { ask: price, info:{ vol }} = await exchange.fetchTicker(symbol);
    const { maker, taker } = allMarkets[realSymbol];
    
    return {
      exchange: 'Kucoin',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume: vol
    }
  }
  return {
    exchange: 'Kucoin',
    exchangePrice: 0,
    feePercent: 0,
    feeBase: 0,
    totalPrice: 0,
    volume: 0
  }
}

export const compareExchangesOperation = async (req: FastifyRequest, res: FastifyReply) => {
  const { marketType, symbol, userPriceUnit, userSize, type } = req.body as any;

console.log('chegou na req symbol: ', symbol)

  const binanceResponse = await getBinancePrice(marketType, symbol, type, userPriceUnit, userSize);
  const huobiResponse = await getHuobiPrice(marketType, symbol, type, userPriceUnit, userSize);
  const ftxResponse = await getFTXPrice(marketType, symbol, type, userPriceUnit, userSize);
  const kucoinResponse = await getKucoinPrice(marketType, symbol, type, userPriceUnit, userSize);


  // return res.send(binanceResponse);
  return res.send({type: type, quote: symbol.split('/')[1], compare:  [binanceResponse, huobiResponse, ftxResponse, kucoinResponse]});
}
