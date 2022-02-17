
import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { formatPercentage } from '../../util/formatPercent';
import { removeScientificNotation } from '../../util/removeScientificNotation';

const getPriceByUSDT = async  (exchangeName, quoteArray, formatedMarket) => {
  const exchange = new ccxt[exchangeName]({
    'options': {
      'defaultType': exchangeName === 'gateio' ? 'swap' : 'future',   
    }});
  const formatedSymbols = quoteArray.map(quote => `${quote}/USDT`);


  // if (exchangeName === 'huobi')
    // await exchange.fetchTicker('ETH/USDT');

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
  const exchange = new ccxt.binance({
    'options': {
      'defaultType': 'future',   
    }}
  );
  const filterMarkets = [];
  const baseArry = [];
  
  listMarkets.map(item => {
    if(!filterMarkets.find(subitem=> subitem === item.symbol) 
    && item.future                                
    && item.quote === quote                                
    // && item.info.status === 'TRADING'
    ){                     
      return filterMarkets.push(item.symbol);
    }
  });

  const verifyAuxQuote = quote === 'USDT' || quote === 'USD' || quote === 'BUSD';

  const allTickers = await exchange.fetchTickers(filterMarkets)

  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map(item => {
    const [ auxBase , auxQuote] = allTickers[item].symbol.split('/');
    if(!baseArry.find(base => base === auxBase)){
      baseArry.push(auxBase);
    }
    const verifyAuxQuote = auxQuote === 'USDT' || auxQuote === 'USD' || auxQuote === 'BUSD';

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      market: auxBase,
      price: removeScientificNotation(+allTickers[item].info.lastPrice),
      price_usd: verifyAuxQuote ? removeScientificNotation(+allTickers[item].info.lastPrice) : 0,
      volume_24h: +allTickers[item].info.volume,
      volume_24h_usd: verifyAuxQuote ? removeScientificNotation(+allTickers[item].info.volume * +allTickers[item].info.lastPrice) : 0,
      variationPrice: +allTickers[item].info.priceChange,
      change_24h: +allTickers[item].info.priceChangePercent,
      bid: +allTickers[item].bid,
      ask: +allTickers[item].ask,
      high: +allTickers[item].high,
      low: +allTickers[item].low
    }
  })
  
  if(!verifyAuxQuote) {
    const responseFormated = await getPriceByUSDT('binance', baseArry, formatedMarket);
    return responseFormated
  }
  // console.log(responseFormated[0])
  return formatedMarket

}

const huobiMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.huobi({
    'options': {
      'defaultType': 'future',   
    }});
  const filterMarkets = [];
  const baseArry = [];

  
  listMarkets.map(item => {
    if(!filterMarkets.find(subitem=> subitem === item.symbol) 
      // && item.active !== false  
      // && item.info.state !== 'offline'                               
      // && item.quote === quote                                 
      // && item.info['api-trading'] === 'enabled'
      ){                     
        return filterMarkets.push(item.symbol);
    }
  });

  await exchange.fetchTicker(listMarkets[0].symbol);
  
  const allTickers = await exchange.fetchTickers()
  // const allTickers = await exchange.fetchTickers(filterMarkets)
  
  // console.log('allTickers')
  // console.log(allTickers)
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map(item => {
    const [ auxBase , auxQuote] = allTickers[item].symbol.split('/');
    const variationPrice = +allTickers[item].open - +allTickers[item].ask;
    // if(!baseArry.find(base => base === auxBase)){
    //   baseArry.push(auxBase);
    // 
    return {
      symbol: allTickers[item].symbol,
      market: auxBase,
      quote: auxQuote,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      price: removeScientificNotation(+allTickers[item].ask),
      price_usd: auxQuote=== 'USDT' ? removeScientificNotation(+allTickers[item].info.ask) : 0,
      volume_24h: +allTickers[item].info.quoteVolume ? +allTickers[item].info.quoteVolume : +allTickers[item].info.vol,
      volume_24h_usd: auxQuote=== 'USDT' ? removeScientificNotation(+allTickers[item].baseVolume * +allTickers[item].info.ask) : 0,
      variationPrice,
      change_24h: +allTickers[item].percentage,
      bid: +allTickers[item].info.bid,
      ask: +allTickers[item].info.ask,
      high: +allTickers[item].info.high,
      low: +allTickers[item].info.low
    }
  })

  // const responseFormated = await getPriceByUSDT('huobi', baseArry, formatedMarket);
  return formatedMarket

}

const ftxMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.ftx({
    'options': {
      'defaultType': 'future',   
    }});
  const baseArry = [];

  const filterMarkets = [];
  listMarkets.map(item => {
    if(!filterMarkets.find(subitem=> subitem === item.symbol) 
      // && item.spot === true                               
      // && item.quote === quote                                 
      // && item.active === true                                 
      // && item.info.enabled === true 
      ){   
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
      price: removeScientificNotation(+allTickers[item].ask),
      price_usd: auxQuote=== 'USDT' ? removeScientificNotation(+allTickers[item].info.ask) : 0,
      volume_24h: +allTickers[item].info.quoteVolume24h,
      volume_24h_usd: auxQuote=== 'USDT' ? removeScientificNotation(+allTickers[item].info.quoteVolume24h * +allTickers[item].info.ask) : 0,
      variationPrice,
      change_24h: (+allTickers[item].percentage),
      bid: +allTickers[item].info.bid,
      ask: +allTickers[item].info.ask,
      high: +allTickers[item].info.high,
      low: +allTickers[item].info.low
    }
  })
    
  // const responseFormated = await getPriceByUSDT('ftx', baseArry, formatedMarket);
  return formatedMarket
}

const kucoinMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.kucoin({
    'options': {
      'defaultType': 'future',   
    }});
  const filterMarkets = [];
  const baseArry = [];
  
  listMarkets.map(item => {
    if(!filterMarkets.find(subitem=> subitem === item.symbol)                                
    && item.quote === quote      
    && item.active === true                           
    && item.info.enableTrading === true){                     
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
      price: removeScientificNotation(+allTickers[item].info.sell),
      price_usd: 0,
      volume_24h: +allTickers[item].info.vol,
      volume_24h_usd: auxQuote=== 'USDT' ? removeScientificNotation(+allTickers[item].info.vol * +allTickers[item].info.sell) : 0,
      variationPrice: +allTickers[item].change,
      change_24h: +allTickers[item].percentage,
      bid: +allTickers[item].bid,
      ask: +allTickers[item].ask,
      high: +allTickers[item].high,
      low: +allTickers[item].low
    }
  })
  
  const responseFormated = await getPriceByUSDT('kucoin', baseArry, formatedMarket);
  return responseFormated
}

const gateioMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.gateio({
    'options': {
      'defaultType': 'swap',   
    }}
  );
  const filterMarkets = [];
  const baseArry = [];

  listMarkets.map(item => {
    if (
      !filterMarkets.find(subitem => subitem === item.symbol) &&
      item.swap &&
      item.quote === quote
    ) {                     
      return filterMarkets.push(item.symbol);
    }
  });

  const allTickers = await exchange.fetchTickers(filterMarkets)

  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map(item => {
    const symbol = allTickers[item].symbol.split(':')[0];
    const [ auxBase , auxQuote] = symbol.split('/');
    if (!baseArry.find(base => base === auxBase)){
      baseArry.push(auxBase);
    }

    return {
      symbol: symbol,
      quote: auxQuote,
      precision: {amount: 4 , base: 8 , price: 6 , quote: 8},
      market: auxBase,
      price: removeScientificNotation(+allTickers[item].info.last),
      price_usd: removeScientificNotation(+allTickers[item].info.last),
      volume_24h: +allTickers[item].info.volume_24h_base,
      volume_24h_usd: removeScientificNotation(+allTickers[item].info.volume_24h_base * +allTickers[item].info.last),
      variationPrice: +allTickers[item].change,
      change_24h: +allTickers[item].info.change_percentage,
      bid: +allTickers[item].bid,
      ask: +allTickers[item].ask,
      high: +allTickers[item].high,
      low: +allTickers[item].low
    }
  })
  
  return formatedMarket
}

export const loadMarketOverviewFuture = async (req: FastifyRequest, res: FastifyReply) => {
  const { exchangeName, quote } = req.params as any;
  const formattedQuote = quote.toUpperCase();
  const formatedExchangeName = exchangeName.toLowerCase();
  const exchange = new ccxt[formatedExchangeName]({
    'options': {
      'defaultType': formatedExchangeName === 'gateio' ? 'swap' : 'future',
    }});
  const response = await exchange.fetchMarkets();
  const allSingleQuotes = [];

  var onlyMarkets = []; 
  switch(formatedExchangeName) {
    case 'binance':
      onlyMarkets = await binanceMarketQuote(formattedQuote, response);
    break;

    case 'huobi':
      onlyMarkets = await huobiMarketQuote(formattedQuote, response);
    break;

    case 'ftx':
      onlyMarkets = await ftxMarketQuote(formattedQuote, response);
    break;

    case 'kucoin':
      onlyMarkets = await kucoinMarketQuote(formattedQuote, response);
    break;

    case 'gateio':
      onlyMarkets = await gateioMarketQuote(formattedQuote, response);
    break;
  }

  const orderedMarkets = onlyMarkets.sort((a :any, b :any) =>  a.volume - b.volume);

  response.forEach(item => {
    if (!allSingleQuotes.find(subitem=> subitem === item.quote)) {
      if (item.symbol.includes('-')) {
        item.symbol.replace('-', '/');
      }
      let [ _ , auxQuote] = item.symbol.split('/');
      auxQuote = auxQuote.split(':')[0];
      return allSingleQuotes.push(auxQuote);
    }
  })

  return res.send({
    allSingleQuotes,
    marketOfQuote: orderedMarkets,
  });
}

export const loadSymbolOverviewFuture = async (req: FastifyRequest, res: FastifyReply) => {
  const { symbol } = req.params as any;
  const formattedSymbol = symbol.replace('-', '/');
  const exchanges = ['binance' , 'huobi', 'ftx'];
  const allValues = [];

  await Promise.all(
    exchanges.map(async (exchangeName) => {
      try {
      const exchange = new ccxt[exchangeName]({
        'options': {
          'defaultType': 'future',   
        }});
      const markets = await exchange.loadMarkets();
      if(markets[formattedSymbol]){
        const formattedSymbolMarket = await exchange.fetchTicker(formattedSymbol);
        allValues.push({
          exchange: exchangeName,
          price: formattedSymbolMarket.ask
        })
        
        }  
      }catch(err){
        console.log(err)
      }
    })
   
  )
 


  return res.send(allValues)
}
