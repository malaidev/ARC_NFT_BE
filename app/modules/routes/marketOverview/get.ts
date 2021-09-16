import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { formatPercentage } from '../../util/formatPercent';
import { respond } from "../../util/respond";
import axios from 'axios';

const binanceMarketQuote = async (quote: string, listMarkets: any, dolar:any) => {
  const exchange = new ccxt.binance();
  const response = await exchange.fetchMarkets();
  const filterMarkets = [];

  
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
    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      market: auxBase,
      price: +allTickers[item].info.lastPrice,
      price_usd: +allTickers[item].info.lastPrice * +dolar,
      volume_24h: +allTickers[item].info.volume,
      volume_24h_usd: +allTickers[item].info.volume * +dolar,
      variationPrice: +allTickers[item].info.priceChange,
      change_24h: +allTickers[item].info.priceChangePercent,
      bid: +allTickers[item].bid,
      ask: +allTickers[item].ask,
      high: +allTickers[item].high,
      low: +allTickers[item].low
    }
  })
    return formatedMarket
}

const huobiMarketQuote = async (quote: string, listMarkets: any, dolar:any) => {
  const exchange = new ccxt.huobi();
  const response = await exchange.fetchMarkets();
  const filterMarkets = [];

  
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
    if(allTickers[item].symbol === 'BCH/BTC') console.log(allTickers[item])
    const variationPrice = +allTickers[item].open - +allTickers[item].ask;
    return {
      symbol: allTickers[item].symbol,
      market: auxBase,
      quote: auxQuote,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      price: +allTickers[item].ask,
      price_usd: +allTickers[item].ask * +dolar,
      volume_24h: +allTickers[item].info.vol,
      volume_24h_usd: +allTickers[item].info.vol * +dolar,
      variationPrice,
      change_24h: +allTickers[item].percentage,
      bid: +allTickers[item].info.bid,
      ask: +allTickers[item].info.ask,
      high: +allTickers[item].info.high,
      low: +allTickers[item].info.low
    }
  })
    return formatedMarket
}

const ftxMarketQuote = async (quote: string, listMarkets: any, dolar:any) => {
  const exchange = new ccxt.ftx();
  const response = await exchange.fetchMarkets();
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

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      market: auxBase,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      price: +allTickers[item].ask,
      price_usd: +allTickers[item].ask * +dolar,
      volume_24h: +allTickers[item].info.quoteVolume24h,
      volume_24h_usd: +allTickers[item].info.volumeUsd24h,
      variationPrice,
      change_24h: formatPercentage((+allTickers[item].percentage)),
      bid: +allTickers[item].info.bid,
      ask: +allTickers[item].info.ask,
      high: +allTickers[item].info.high,
      low: +allTickers[item].info.low
    }
  })
    return formatedMarket

}

export const loadMarketOverview = async (req: FastifyRequest, res: FastifyReply) => {
  const { exchangeName, quote } = req.params as any;
  const formatedExchangeName = exchangeName.toLowerCase();
  const exchange = new ccxt[formatedExchangeName]();
  const response = await exchange.fetchMarkets();
  const allSingleQuotes = [];

  const responseDolar = await axios.get('http://economia.awesomeapi.com.br/json/last/USD-BRL');
  const dolar = responseDolar.data['USDBRL'].ask

  
  const onlySpotMarkets =
  formatedExchangeName === 'binance' 
      ? await binanceMarketQuote(quote, response, dolar) 
      : formatedExchangeName === 'huobi'
        ? await huobiMarketQuote(quote, response, dolar)
        : await ftxMarketQuote(quote, response, dolar); 
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
