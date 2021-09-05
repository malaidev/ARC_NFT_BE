import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { formatPercentage } from '../../util/formatPercent';
import { respond } from "../../util/respond";

const binanceMarketQuote = async (quote: string, listMarkets: any) => {
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
    const [ _ , auxQuote] = allTickers[item].symbol.split('/');
    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      volume: +allTickers[item].info.volume,
      price: +allTickers[item].info.lastPrice,
      variationPrice: +allTickers[item].info.priceChange,
      variationPercent: formatPercentage(+allTickers[item].info.priceChangePercent)
    }
  })
    return formatedMarket
}

const huobiMarketQuote = async (quote: string, listMarkets: any) => {
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
    const [ _ , auxQuote] = allTickers[item].symbol.split('/');
    if(allTickers[item].symbol === 'BCH/BTC') console.log(allTickers[item])
    const variationPrice = +allTickers[item].open - +allTickers[item].ask;
    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      volume: +allTickers[item].info.vol,
      price: +allTickers[item].ask,
      variationPrice,
      variationPercent: formatPercentage((+allTickers[item].percentage))
    }
  })
    return formatedMarket
}

const ftxMarketQuote = async (quote: string, listMarkets: any) => {
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
    let separateAux = allTickers[item].symbol.includes('/') ? '/' : '-';
    const [ _ , auxQuote] = allTickers[item].symbol.split(separateAux);
    const variationPrice = +allTickers[item].ask - +allTickers[item].close;

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      volume: +allTickers[item].info.volumeUsd24h,
      price: +allTickers[item].ask,
      variationPrice,
      variationPercent: formatPercentage((+allTickers[item].percentage))
    }
  })
    return formatedMarket

}

export const loadMarketOverview = async (req: FastifyRequest, res: FastifyReply) => {
  const { exchangeName, quote } = req.params as any;
  console.log('exchangeName: ', exchangeName)
  console.log('quote: ', quote)
  const exchange = new ccxt[exchangeName]();
  const response = await exchange.fetchMarkets();
  const allSingleQuotes = [];

  const onlySpotMarkets =
    exchangeName === 'binance' 
      ? await binanceMarketQuote(quote, response) 
      : exchangeName === 'huobi'
        ? await huobiMarketQuote(quote, response)
        : await ftxMarketQuote(quote, response); 
  const ordenedMarkets = onlySpotMarkets.sort((a :any, b :any) =>  a.volume - b.volume);

  response.forEach(item => {
    if(!allSingleQuotes.find(subitem=> subitem === item.quote)){
      const separateAux = item.symbol.includes('/') ? '/' : '-';
      const [ _ , auxQuote] = item.symbol.split(separateAux);
      return allSingleQuotes.push(auxQuote);
    }
  })
  

    return res.send({
      allSingleQuotes,
      marketOfQuote: ordenedMarkets,
    })
}
