import * as ccxt from "ccxt";
import Axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";

import binanceService from "../../services/BinanceService";

const UniswapV2API =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
const UniswapV3API =
  "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const getPriceFromUniswap = async (address: string) => {
  if (!address) {
    return 0;
  }

  const {
    data: {
      data: {
        bundle: { ethPrice },
      },
    },
  } = await await Axios.post(UniswapV2API, {
    query: `{bundle(id: 1) { id ethPrice } }`,
  });

  const { data: v2Data } = await Axios.post(UniswapV2API, {
    query: `{token(id: "${address}") { id derivedETH } }`,
  });

  if (v2Data.errors || !v2Data.data.token) {
    const { data: v3Data } = await Axios.post(UniswapV3API, {
      query: `{token(id: "${address}") { id derivedETH } }`,
    });

    if (v3Data.data.token) {
      return Number(ethPrice) * Number(v3Data.data.token.derivedETH);
    }
  } else if (v2Data.data.token) {
    return Number(ethPrice) * Number(v2Data.data.token.derivedETH);
  }
  return 0;
};

export const getTokenUsdtPrice = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { symbol, address } = req.params as any;
  if (symbol == "USDT") {
    return res.send({
      symbol: "USDT/USDT",
      price: 1,
    });
  }
  
  const formattedSymbol = `${symbol}/USDT`;
  try {
    const price = await binanceService.getPrice(`${symbol}usdt`);
    return res.send({
      symbol: formattedSymbol,
      price: price,
    });
  } catch (err1) {
    const tokenPrice = await getPriceFromUniswap(address);

    return res.send({
      symbol: formattedSymbol,
      price: tokenPrice,
    });
  }
};

export const getTokenUsdtPrices = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { quotes, addresses } = req.body as {
    quotes: string[];
    addresses: string[];
  };

  try {
    const binance = new ccxt.binance();
    const formattedSymbols = quotes.map((quote: string) => `${quote}/USDT`);
    const allTickers = await binance.fetchTickers(formattedSymbols);
    // Parse the tickers removing `/USDT`;
    let parsedTickers = {};
    Object.keys(allTickers).forEach((key) => {
      parsedTickers[key.split(/\/|\-/)[0]] = allTickers[key].average;
    });

    for (let i = 0; i < quotes.length; i++) {
      if (!parsedTickers[quotes[i]]) {
        parsedTickers = {
          ...parsedTickers,
          [quotes[i]]: await getPriceFromUniswap(addresses[i]),
        };
      }
    }

    res.send(parsedTickers);
  } catch (error) {
    const err = error as Error;
    res.code(400).send(err.message);
  }
};
