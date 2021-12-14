import * as ccxt from 'ccxt';

export async function verifySymbolFormate(exchangeName: string, marketType: string, symbol: string) {
 try {
  const exchange = new ccxt[exchangeName]({
    'options': {
      'defaultType': marketType
    }
  });

  const allMarkets = await exchange.loadMarkets();

  const formattedSymbol = symbol.indexOf('-') !== -1 ? symbol.replace('-', '/') : symbol.replace('/', '-');

  const realSymbol = allMarkets[symbol] ? symbol : allMarkets[formattedSymbol] ? formattedSymbol : undefined

  return realSymbol;
 }catch(err){
   console.log(err)
 }
}