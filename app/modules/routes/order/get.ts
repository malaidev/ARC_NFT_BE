import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from '../../controller/DepoUserController';
import { IExtraApiKeyFields } from '../../interfaces/IAPIKey';
import { ISendOrder } from '../../interfaces/ISendOrder';
import { respond } from "../../util/respond";

export const sendOrder = async (req: FastifyRequest, res: FastifyReply) => {
  const { order, marketType } = req.body as ISendOrder;
  const { exchangeName } = req.params as any;
  let createMarketBuyOrderRequiresPrice = true;
  let userSubAccount: IExtraApiKeyFields = { 
    fieldName: '', 
    value: ''
  }
  
  const formattedExchangeName = exchangeName.toLowerCase();
  const formattedType = order.orderType.toLowerCase();
  const formattedSide = order.offerType.toLowerCase();
  const clt = new DepoUserController();
  const userAPIKeys = await clt.getUserApiKeys(order.user.settings.defaultWallet);
  const userSelectedExchange = userAPIKeys.find(exchange => exchange.id.toLowerCase() === formattedExchangeName);
 
  if (formattedExchangeName === 'huobi' && formattedType === 'market') {
    createMarketBuyOrderRequiresPrice = true;
  } 

  if (userSelectedExchange.id.toLowerCase() === 'ftx' && userSelectedExchange.extraFields.length > 0) {
    userSubAccount = userSelectedExchange.extraFields?.find(field => field.fieldName === 'Subaccount');
  }

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const exchange = new ccxt[formattedExchangeName]({
        'apiKey': userSelectedExchange.apiKey,
        'secret': userSelectedExchange.apiSecret,
        'enableRateLimit': true,
        'options': {
          'createMarketBuyOrderRequiresPrice': createMarketBuyOrderRequiresPrice,
          'defaultType': marketType
        }
      });

      if(userSelectedExchange.id.toLowerCase() === 'ftx' && userSubAccount ){
        exchange.headers['FTX-SUBACCOUNT'] = userSubAccount.value
      }

      if (userSelectedExchange.id.toLowerCase() === 'kucoin') {
        exchange.password = userSelectedExchange.passphrase;
      }  

      await exchange.checkRequiredCredentials() // throw AuthenticationError

      //checking correct symbol format
      const allMarkets = await exchange.loadMarkets();
      const formattedSymbol = order.symbolPair.replace('-', '/');
      const realSymbol = allMarkets[order.symbolPair] ? order.symbolPair : allMarkets[formattedSymbol] ? formattedSymbol : undefined
    
      if(realSymbol){
        const response = await exchange.createOrder(realSymbol, formattedType, formattedSide, order.amount, order.price);
        if (!response) {
          res.code(204).send();
        } else {
          return res.send({ response });
        }
      }
    } catch(err) {
      console.log(err);
      res.send(err.message);
    }
  } else {
    res.code(400).send(respond("`Exchange name cannot be null.`", true, 400));
  }
}

export const sendCancelOrder = async (req: FastifyRequest, res: FastifyReply) => {
  let createMarketBuyOrderRequiresPrice = true;
  let userSubAccount: IExtraApiKeyFields = { 
    fieldName: '', 
    value: ''
  }

  const { exchangeName, orderId, symbol,  walletId } = req.params as any;
  const formattedExchangeName = exchangeName.toLowerCase();
  const formattedSymbol = symbol.replace('-', '/');

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const clt = new DepoUserController();
      const userAPIKeys = await clt.getUserApiKeys(walletId);
      const userSelectedExchange = userAPIKeys.find(exchangeItem => exchangeItem.id.toLowerCase() === formattedExchangeName);
      if (formattedExchangeName === 'huobi') {
        createMarketBuyOrderRequiresPrice = false;
      } 
    
      if (userSelectedExchange.id.toLowerCase() === 'ftx' && userSelectedExchange.extraFields.length > 0) {
        userSubAccount = userSelectedExchange.extraFields?.find(field => field.fieldName === 'Subaccount');
      }

      
    
      if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
        const exchange = new ccxt[formattedExchangeName]({
          'apiKey': userSelectedExchange.apiKey,
          'secret': userSelectedExchange.apiSecret,
          'enableRateLimit': true,
          'options': {
            'createMarketBuyOrderRequiresPrice': createMarketBuyOrderRequiresPrice,
          }
        });


        if(userSelectedExchange.id.toLowerCase() === 'ftx' && userSubAccount ){
          exchange.headers['FTX-SUBACCOUNT'] = userSubAccount.value
        }
         
        if (userSelectedExchange.id.toLowerCase() === 'kucoin') {
          exchange.password = userSelectedExchange.passphrase;
        }

        const response = await exchange.cancelOrder(orderId, formattedSymbol);
        if (!response) {
          res.code(204).send();
        } else {
          return res.send({ response });
        }
   
      } else {
        res.code(400).send(respond("`Exchange name cannot be null.`", true, 400));
      }
  } catch(err) {
    console.log(err);
    return res.send({ err });
  }
  }
}
