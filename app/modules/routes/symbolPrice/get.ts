import * as ccxt from "ccxt";
import { FastifyReply, FastifyRequest } from "fastify";

export const getSymbolUsdtPrice = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { symbol } = req.params as any;
  if (symbol == "USDT") {
    return res.send({
      symbol: "USDT/USDT",
      price: 1,
    });
  }

  const exchange = new ccxt.binance();
  await exchange.fetchMarkets();
  const formatedSymbol = `${symbol}/USDT`;
  const ticker = await exchange.fetchTicker(formatedSymbol);

  const symbolPrice = +ticker.ask;

  return res.send({
    symbol: formatedSymbol,
    price: symbolPrice,
  });
};

export const getSymbolUsdtPrices = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const quotes: string[] = req.body as string[];
  try {
    const binance = new ccxt.binance();
    const formattedSymbols = quotes.map((quote: string) => `${quote}/USDT`);
    const allTickers = await binance.fetchTickers(formattedSymbols);
    // Parse the tickers removing `/USDT`;
    const parsedTickers = {};
    Object.keys(allTickers).forEach((key) => {
      parsedTickers[key.split(/\/|\-/)[0]] = allTickers[key].average;
    });

    res.send(parsedTickers);
  } catch (error) {
    const err = error as Error;
    res.code(400).send(err.message);
  }
};
