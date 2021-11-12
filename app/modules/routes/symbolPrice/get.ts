import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";


export const getSymbolUsdtPrice = async (req: FastifyRequest, res: FastifyReply) => {
    const { symbol } = req.params as any;  
    const exchange = new ccxt.binance();
    await exchange.fetchMarkets();
    const formatedSymbol = `${symbol}/USDT`;
    const ticker = await exchange.fetchTicker(formatedSymbol);
  
    const symbolPrice =  +ticker.ask;

    return res.send({
      symbol: formatedSymbol,
      price: symbolPrice
    })
}

