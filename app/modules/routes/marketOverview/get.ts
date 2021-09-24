import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { formatPercentage } from '../../util/formatPercent';
import { respond } from "../../util/respond";
import axios from 'axios';

const getPriceByUSDT = async  (exchangeName, quoteArray, formatedMarket) => {
  const exchange = new ccxt[exchangeName]();
  const response = await exchange.fetchMarkets();
  const formatedSymbols = quoteArray.map(quote => `${quote}/USDT`);

  const allTickers = await exchange.fetchTickers(formatedSymbols);

  Object.keys(allTickers).forEach(base => {
    const exists = formatedMarket.find(item => item.symbol.split('/')[0] === base.split('/')[0]);
    if(exists){
      exists.volume_24h_usd = +exists.volume_24h * +allTickers[base].ask;
      exists.price_usd = +exists.price * +allTickers[base].ask;
    }
  })
  return formatedMarket;
}

const binanceMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.binance();
  const response = await exchange.fetchMarkets();
  const filterMarkets = [];
  const baseArry = [];
  
  listMarkets.map(item => {
    if(!filterMarkets.find(subitem=> subitem === item.symbol) 
    && item.type === 'spot'                                 
    && item.quote === quote                                 
    && item.info.status === 'TRADING'){                     
      return filterMarkets.push(item.symbol);
    }
  });
  
  const allTickers = await exchange.fetchTickers(filterMarkets)
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map(item => {
    const [ auxBase , auxQuote] = allTickers[item].symbol.split('/');
    if(!baseArry.find(base => base === auxBase)){
      baseArry.push(auxBase);
    }

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      market: auxBase,
      price: +allTickers[item].info.lastPrice,
      price_usd: 0,
      volume_24h: +allTickers[item].info.volume,
      volume_24h_usd: 0,
      variationPrice: +allTickers[item].info.priceChange,
      change_24h: +allTickers[item].info.priceChangePercent,
      bid: +allTickers[item].bid,
      ask: +allTickers[item].ask,
      high: +allTickers[item].high,
      low: +allTickers[item].low
    }
  })
  
  const responseFormated = await getPriceByUSDT('binance', baseArry, formatedMarket);
  // console.log(responseFormated[0])
  return responseFormated

}

const huobiMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.huobi();
  const response = await exchange.fetchMarkets();
  const filterMarkets = [];
  const baseArry = [];

  
  listMarkets.map(item => {
    if(!filterMarkets.find(subitem=> subitem === item.symbol) 
      && item.active !== false  
      && item.info.state !== 'offline'                               
      && item.quote === quote                                 
      && item.info['api-trading'] === 'enabled'){                     
        return filterMarkets.push(item.symbol);
    }
  });

  const allTickers = await exchange.fetchTickers(filterMarkets)
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map(item => {
    const [ auxBase , auxQuote] = allTickers[item].symbol.split('/');
    const variationPrice = +allTickers[item].open - +allTickers[item].ask;
    if(!baseArry.find(base => base === auxBase)){
      baseArry.push(auxBase);
    }
    
    return {
      symbol: allTickers[item].symbol,
      market: auxBase,
      quote: auxQuote,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      price: +allTickers[item].ask,
      price_usd: 0,
      volume_24h: +allTickers[item].info.vol,
      volume_24h_usd: 0,
      variationPrice,
      change_24h: +allTickers[item].percentage,
      bid: +allTickers[item].info.bid,
      ask: +allTickers[item].info.ask,
      high: +allTickers[item].info.high,
      low: +allTickers[item].info.low
    }
  })

  const responseFormated = await getPriceByUSDT('huobi', baseArry, formatedMarket);
  return responseFormated

}

const ftxMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.ftx();
  const response = await exchange.fetchMarkets();
  const baseArry = [];

  const filterMarkets = [];
  listMarkets.map(item => {
    if(!filterMarkets.find(subitem=> subitem === item.symbol) 
      && item.spot === true                               
      && item.quote === quote                                 
      && item.active === true                                 
      && item.info.enabled === true ){   
        const variationPrice = +item.info.ask - +item.info.bid;
        return filterMarkets.push(item.symbol)
    }
  });

  const allTickers = await exchange.fetchTickers(filterMarkets)
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map(item => {
  if(allTickers[item].symbol.includes('-')) {
    allTickers[item].symbol.replace('-','/');
  }
    const [ auxBase , auxQuote] = allTickers[item].symbol.split('/');
    const variationPrice = +allTickers[item].ask - +allTickers[item].close;
    if(!baseArry.find(base => base === auxBase)){
      baseArry.push(auxBase);
    }

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      market: auxBase,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      price: +allTickers[item].ask,
      price_usd: 0,
      volume_24h: +allTickers[item].info.quoteVolume24h,
      volume_24h_usd: 0,
      variationPrice,
      change_24h: formatPercentage((+allTickers[item].percentage)),
      bid: +allTickers[item].info.bid,
      ask: +allTickers[item].info.ask,
      high: +allTickers[item].info.high,
      low: +allTickers[item].info.low
    }
  })
    
  const responseFormated = await getPriceByUSDT('ftx', baseArry, formatedMarket);
  return responseFormated


}

export const loadMarketOverview = async (req: FastifyRequest, res: FastifyReply) => {
  const { exchangeName, quote } = req.params as any;
  const formatedExchangeName = exchangeName.toLowerCase();
  const exchange = new ccxt[formatedExchangeName]();
  const response = await exchange.fetchMarkets();
  const allSingleQuotes = [];
  
  const onlySpotMarkets =
  formatedExchangeName === 'binance' 
      ? await binanceMarketQuote(quote, response) 
      : formatedExchangeName === 'huobi'
        ? await huobiMarketQuote(quote, response)
        : await ftxMarketQuote(quote, response); 
  const ordenedMarkets = onlySpotMarkets.sort((a :any, b :any) =>  a.volume - b.volume);

  response.forEach(item => {
    if(!allSingleQuotes.find(subitem=> subitem === item.quote)){
      if(item.symbol.includes('-')) {
        item.symbol.replace('-','/');
      }
      const [ _ , auxQuote] = item.symbol.split('/');
      return allSingleQuotes.push(auxQuote);
    }
  })

    return res.send({
      allSingleQuotes,
      marketOfQuote: ordenedMarkets,
    })
}
