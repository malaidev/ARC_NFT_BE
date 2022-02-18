import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from 'fastify';
import { formatPercentage } from '../../util/formatPercent';
import { removeScientificNotation } from '../../util/removeScientificNotation';
import Axios from 'axios';

const getPriceByUSDT = async (exchangeName, quoteArray, formatedMarket) => {
  const exchange = new ccxt[exchangeName]();

  const allMarkets = await exchange.loadMarkets();
  const formatedSymbols = [];

  quoteArray.forEach((quote) => {
    const formattedWithUSDT = `${quote}/USDT`;
    const formattedWithUSD = `${quote}/USD`;

    const realSymbol = allMarkets[formattedWithUSDT]
      ? formattedWithUSDT
      : allMarkets[formattedWithUSD]
      ? formattedWithUSD
      : undefined;

    if (realSymbol) return formatedSymbols.push(realSymbol);
  });

  if (exchangeName === 'huobi') await exchange.fetchTicker('ETH/USDT');

  if (exchangeName === 'huobi') await exchange.fetchTicker('ETH/USDT');

  const allTickers = await exchange.fetchTickers(formatedSymbols);

  Object.keys(allTickers).forEach((base) => {
    const exists = formatedMarket.find(
      (item) => item.symbol.split('/')[0] === base.split('/')[0]
    );
    if (exists) {
      exists.volume_24h_usd = +exists.volume_24h * +allTickers[base].ask;
      exists.price_usd = +allTickers[base].ask;
    }
  });
  return formatedMarket;
};

const binanceMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.binance();
  const filterMarkets = [];
  const baseArry = [];

  listMarkets.map((item) => {
    if (
      !filterMarkets.find((subitem) => subitem === item.symbol) &&
      item.type === 'spot' &&
      item.quote === quote &&
      item.info.status === 'TRADING'
    ) {
      return filterMarkets.push(item.symbol);
    }
  });

  const allTickers = await exchange.fetchTickers(filterMarkets);
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map((item) => {
    const [auxBase, auxQuote] = allTickers[item].symbol.split('/');
    if (!baseArry.find((base) => base === auxBase)) {
      baseArry.push(auxBase);
    }

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      precision: { amount: 4, base: 8, price: 6, quote: 8 },
      market: auxBase,
      price: removeScientificNotation(+allTickers[item].info.lastPrice),
      price_usd: 0,
      volume_24h: +allTickers[item].quoteVolume,
      volume_24h_usd: 0,
      variationPrice: +allTickers[item].info.priceChange,
      change_24h: +allTickers[item].info.priceChangePercent,
      bid: +allTickers[item].bid,
      ask: +allTickers[item].ask,
      high: +allTickers[item].high,
      low: +allTickers[item].low,
    };
  });

  const responseFormated = await getPriceByUSDT(
    'binance',
    baseArry,
    formatedMarket
  );
  // console.log(responseFormated[0])
  return responseFormated;
};

const huobiMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.huobi();
  const filterMarkets = [];
  const baseArry = [];

  listMarkets.map((item) => {
    if (
      !filterMarkets.find((subitem) => subitem === item.symbol) &&
      item.active !== false &&
      item.info.state !== 'offline' &&
      item.quote === quote &&
      item.info['api-trading'] === 'enabled'
    ) {
      return filterMarkets.push(item.symbol);
    }
  });

  await exchange.fetchTicker('ETH/USDT');
  const allTickers = await exchange.fetchTickers(filterMarkets);
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map((item) => {
    const [auxBase, auxQuote] = allTickers[item].symbol.split('/');
    const variationPrice = +allTickers[item].open - +allTickers[item].ask;
    if (!baseArry.find((base) => base === auxBase)) {
      baseArry.push(auxBase);
    }

    return {
      symbol: allTickers[item].symbol,
      market: auxBase,
      quote: auxQuote,
      precision: { amount: 4, base: 8, price: 6, quote: 8 },
      price: removeScientificNotation(+allTickers[item].ask),
      price_usd: 0,
      volume_24h: +allTickers[item].quoteVolume,
      volume_24h_usd: 0,
      variationPrice,
      change_24h: +allTickers[item].percentage,
      bid: +allTickers[item].info.bid,
      ask: +allTickers[item].info.ask,
      high: +allTickers[item].info.high,
      low: +allTickers[item].info.low,
    };
  });

  const responseFormated = await getPriceByUSDT(
    'huobi',
    baseArry,
    formatedMarket
  );
  return responseFormated;
};

const ftxMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.ftx();
  const baseArry = [];

  const filterMarkets = [];
  listMarkets.map((item) => {
    if (
      !filterMarkets.find((subitem) => subitem === item.symbol) &&
      item.spot === true &&
      item.quote === quote &&
      item.active === true &&
      item.info.enabled === true
    ) {
      const variationPrice = +item.info.ask - +item.info.bid;
      return filterMarkets.push(item.symbol);
    }
  });

  const allTickers = await exchange.fetchTickers(filterMarkets);
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map((item) => {
    if (allTickers[item].symbol.includes('-')) {
      allTickers[item].symbol.replace('-', '/');
    }
    const [auxBase, auxQuote] = allTickers[item].symbol.split('/');
    const variationPrice = +allTickers[item].ask - +allTickers[item].close;
    if (!baseArry.find((base) => base === auxBase)) {
      baseArry.push(auxBase);
    }

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      market: auxBase,
      precision: { amount: 4, base: 8, price: 6, quote: 8 },
      price: removeScientificNotation(+allTickers[item].ask),
      price_usd: 0,
      volume_24h: +allTickers[item].info.quoteVolume
        ? +allTickers[item].info.quoteVolume
        : +allTickers[item].info.vol,
      volume_24h_usd: 0,
      variationPrice,
      change_24h: +allTickers[item].percentage,
      // change_24h: formatPercentage((+allTickers[item].percentage)),
      bid: +allTickers[item].info.bid,
      ask: +allTickers[item].info.ask,
      high: +allTickers[item].info.high,
      low: +allTickers[item].info.low,
    };
  });

  const responseFormated = await getPriceByUSDT(
    'ftx',
    baseArry,
    formatedMarket
  );
  return responseFormated;
};

const kucoinMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.kucoin();
  const filterMarkets = [];
  const baseArry = [];

  listMarkets.map((item) => {
    if (
      !filterMarkets.find((subitem) => subitem === item.symbol) &&
      item.type === 'spot' &&
      item.quote === quote &&
      item.active === true &&
      item.info.enableTrading === true
    ) {
      return filterMarkets.push(item.symbol);
    }
  });

  const allTickers = await exchange.fetchTickers(filterMarkets);
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map((item) => {
    const [auxBase, auxQuote] = allTickers[item].symbol.split('/');
    if (!baseArry.find((base) => base === auxBase)) {
      baseArry.push(auxBase);
    }

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      precision: { amount: 4, base: 8, price: 6, quote: 8 },
      market: auxBase,
      price: removeScientificNotation(+allTickers[item].info.sell),
      price_usd: 0,
      volume_24h: +allTickers[item].quoteVolume,
      volume_24h_usd: 0,
      variationPrice: +allTickers[item].change,
      change_24h: +allTickers[item].percentage,
      bid: +allTickers[item].bid,
      ask: +allTickers[item].ask,
      high: +allTickers[item].high,
      low: +allTickers[item].low,
    };
  });

  const responseFormated = await getPriceByUSDT(
    'kucoin',
    baseArry,
    formatedMarket
  );
  return responseFormated;
};

const gateioMarketQuote = async (quote: string, listMarkets: any) => {
  const exchange = new ccxt.gateio();
  const filterMarkets = [];
  const baseArry = [];

  listMarkets.map((item) => {
    if (
      !filterMarkets.find((subitem) => subitem === item.symbol) &&
      item.type === 'spot' &&
      item.info.quote === quote &&
      item.info.trade_status === 'tradable'
    ) {
      return filterMarkets.push(item.symbol);
    }
  });

  const allTickers = await exchange.fetchTickers(filterMarkets);
  const allSymbols = Object.keys(allTickers);
  const formatedMarket = allSymbols.map((item) => {
    const [auxBase, auxQuote] = allTickers[item].symbol.split('/');
    if (!baseArry.find((base) => base === auxBase)) {
      baseArry.push(auxBase);
    }

    return {
      symbol: allTickers[item].symbol,
      quote: auxQuote,
      precision: { amount: 4, base: 8, price: 6, quote: 8 },
      market: auxBase,
      price: removeScientificNotation(+allTickers[item].info.last),
      price_usd: 0,
      volume_24h: +allTickers[item].quoteVolume,
      volume_24h_usd: 0,
      variationPrice: +allTickers[item].change,
      change_24h: +allTickers[item].info.change_percentage,
      bid: +allTickers[item].bid,
      ask: +allTickers[item].ask,
      high: +allTickers[item].high,
      low: +allTickers[item].low,
    };
  });

  const responseFormated = await getPriceByUSDT(
    'gateio',
    baseArry,
    formatedMarket
  );
  return responseFormated;
};

export const loadMarketOverview = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { type, exchangeName, quote } = req.params as any;
  const formatedQuote = quote.toUpperCase();
  const formatedExchangeName = exchangeName.toLowerCase();
  const exchange = new ccxt[formatedExchangeName]();
  const response = await exchange.fetchMarkets();
  const allSingleQuotes = [];

  var onlyMarkets = [];

  switch (formatedExchangeName) {
    case 'binance':
      onlyMarkets = await binanceMarketQuote(formatedQuote, response);
      break;

    case 'huobi':
      onlyMarkets = await huobiMarketQuote(formatedQuote, response);
      break;

    case 'ftx':
      onlyMarkets = await ftxMarketQuote(formatedQuote, response);
      break;

    case 'kucoin':
      onlyMarkets = await kucoinMarketQuote(formatedQuote, response);
      break;

    case 'gateio':
      onlyMarkets = await gateioMarketQuote(formatedQuote, response);
      break;
  }

  const orderedMarkets = onlyMarkets.sort(
    (a: any, b: any) => a.volume - b.volume
  );

  response.forEach((item) => {
    if (!allSingleQuotes.find((subitem) => subitem === item.quote)) {
      if (item.symbol.includes('-')) {
        item.symbol.replace('-', '/');
      }
      const [_, auxQuote] = item.symbol.split('/');
      return allSingleQuotes.push(auxQuote);
    }
  });

  return res.send({
    allSingleQuotes,
    marketOfQuote: orderedMarkets,
  });
};

export const loadSymbolOverview = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { type, symbol } = req.params as any;
  const formattedSymbol = symbol.replace('-', '/');

  const exchanges = ['gateio', 'binance', 'huobi', 'ftx', 'kucoin'];
  const allValues = [];

  await Promise.all(
    exchanges.map(async (exchangeName) => {
      try {
        const exchange = new ccxt[exchangeName]();

        if (exchangeName === 'kucoin') {
          exchange.apiKey = process.env['KUCOIN_SERVICE_API_KEY'];
          exchange.secret = process.env['KUCOIN_SERVICE_SECRET'];
          exchange.password = process.env['KUCOIN_SERVICE_PASSPHRASE'];
          await exchange.checkRequiredCredentials(); // throw AuthenticationError
        }

        const markets = await exchange.loadMarkets();
        const realSymbol = markets[symbol]
          ? symbol
          : markets[formattedSymbol]
          ? formattedSymbol
          : undefined;
        if (realSymbol) {
          const formattedSymbolMarket = await exchange.fetchTicker(realSymbol);
          allValues.push({
            exchange: exchangeName,
            price: removeScientificNotation(+formattedSymbolMarket.ask),
          });
        }
      } catch (err) {
        console.log(err);
      }
    })
  );

  return res.send(allValues);
};

export const fetchGateioMarketCandlesticks = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { currency_pair } = req.params as any;

  try {
    const { data } = await Axios.get(
      `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=${currency_pair}`
    );
    return res.send(data);
  } catch (err) {
    console.log(err);
  }
  return res.send([]);
};
