import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";

const getBinancePrice = async (marketType: string, symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.binance();
  exchange.options.defaultType = marketType;
  const allMarkets = await exchange.loadMarkets();
  
  const formattedSymbol = symbol.replace('-', '/');

  const realSymbol = allMarkets[symbol] ? symbol : allMarkets[formattedSymbol] ? formattedSymbol : undefined

  if(realSymbol){
    const { info:{ lastPrice: price}, quoteVolume } = await exchange.fetchTicker(realSymbol);
    const { maker, taker } = allMarkets[realSymbol];
    
    return {
      exchange: 'Binance',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume: quoteVolume
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
    const { ask: price, quoteVolume } = await exchange.fetchTicker(realSymbol);
    const { maker, taker } = allMarkets[realSymbol];

    return {
      exchange: 'Huobi',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume: quoteVolume
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

  if(realSymbol){
    const { ask: price, quoteVolume, info:{ vol }  } = await exchange.fetchTicker(realSymbol);
    const { maker, taker } = allMarkets[realSymbol];

    return {
      exchange: 'FTX',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume: quoteVolume ? quoteVolume : vol
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
    const { ask: price, quoteVolume } = await exchange.fetchTicker(realSymbol);
    const { maker, taker } = allMarkets[realSymbol];
    
    return {
      exchange: 'Kucoin',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume: quoteVolume
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

const getGateioPrice = async (marketType: string, symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt.gateio();
  exchange.options.defaultType = marketType === 'future' ? 'swapp' : marketType;
  const allMarkets = await exchange.loadMarkets();
 
  let formattedSymbol = symbol.replace('-', '/');
  if (marketType === 'future') {
    formattedSymbol = `${formattedSymbol}:${formattedSymbol.split('/')[1]}`;
  }
  const realSymbol = allMarkets[symbol] ? symbol : allMarkets[formattedSymbol] ? formattedSymbol : undefined

  if (realSymbol){
    const { ask: price, quoteVolume } = await exchange.fetchTicker(realSymbol);
    const { maker, taker } = allMarkets[realSymbol];
    
    return {
      exchange: 'Gate.io',
      exchangePrice: price,
      feePercent: type === 'maker' ? maker : taker,
      feeBase: (+userSize * (type === 'maker' ? +maker : +taker)),
      totalPrice: +userPriceUnit * +userSize,
      volume: quoteVolume
    }
  }
  return {
    exchange: 'Gate.io',
    exchangePrice: 0,
    feePercent: 0,
    feeBase: 0,
    totalPrice: 0,
    volume: 0
  }
}

export const compareExchangesOperation = async (req: FastifyRequest, res: FastifyReply) => {
  const { marketType, symbol, userPriceUnit, userSize, type } = req.body as any;

  const binanceResponse = await getBinancePrice(marketType, symbol, type, userPriceUnit, userSize);
  const huobiResponse = await getHuobiPrice(marketType, symbol, type, userPriceUnit, userSize);
  const ftxResponse = await getFTXPrice(marketType, symbol, type, userPriceUnit, userSize);
  const kucoinResponse = await getKucoinPrice(marketType, symbol, type, userPriceUnit, userSize);
  const gateioResponse = await getGateioPrice(marketType, symbol, type, userPriceUnit, userSize);

  return res.send({type: type, quote: symbol.split('/')[1], compare:  [binanceResponse, huobiResponse, ftxResponse, kucoinResponse, gateioResponse]});
}
