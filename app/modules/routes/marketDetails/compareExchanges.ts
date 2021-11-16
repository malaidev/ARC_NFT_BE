import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { capitalize } from '../../util/FirstLetterCapital';

const getExchangesPrice = async (exchangeName:string ,symbol: string, type:string, userPriceUnit: string, userSize: string) => {
  const exchange = new ccxt[exchangeName]();
  const allMarkets = await exchange.loadMarkets();

  // need get price? or will use the one sent from the front?
  const { ask: price, info} = await exchange.fetchTicker(symbol);
  const { maker, taker } = allMarkets[symbol];


  return {
    exchange: capitalize(exchangeName),
    exchangePrice: price,
    feePercent: type === 'maker' ? maker : taker,
    feeBase: (+userSize * (type === 'maker' ? maker : taker)),
    totalPrice: +userPriceUnit * +userSize,
    volume: 
      exchangeName === 'binance' ? +info.volume 
      : exchangeName === 'huobi' 
        ? +info.vol 
        : +info.quoteVolume24h
  }

}


export const compareExchangesOperation = async (req: FastifyRequest, res: FastifyReply) => {
  const { symbol, userPriceUnit, userSize, type } = req.body as any;

  console.log('BTC/ETH')

  const binanceResponse = await getExchangesPrice('binance', symbol, type, userPriceUnit, userSize);
  const huobiResponse = await getExchangesPrice('huobi', symbol, type, userPriceUnit, userSize);
  const ftxResponse = await getExchangesPrice('ftx', symbol, type, userPriceUnit, userSize);

  return res.send([binanceResponse, huobiResponse, ftxResponse]);
}