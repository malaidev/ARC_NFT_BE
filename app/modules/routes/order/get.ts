import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from '../../controller/DepoUserController';
import { IExtraApiKeyFields } from '../../interfaces/IAPIKey';
import { IOrder } from '../../interfaces/IOrder';
import { respond } from "../../util/respond";

export const sendOrder = async (req: FastifyRequest, res: FastifyReply) => {
  const order: IOrder = req.body;
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
  const userAPIKeys = await clt.getUserApiKeys(order.user.address);
  const userSelectedExchange = userAPIKeys.find(exchange => exchange.id.toLowerCase() === formattedExchangeName);
  if (formattedExchangeName === 'huobi' && formattedType === 'market') {
    createMarketBuyOrderRequiresPrice = false;
  } 

  if (userSelectedExchange.id.toLowerCase() === 'ftx' && userSelectedExchange.extraFields.length > 0) {
    userSubAccount = userSelectedExchange.extraFields.find(field => field.fieldName === 'Subaccount');
  }

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const exchange = new ccxt[formattedExchangeName]({
        'headers': {
          'FTX-SUBACCOUNT': userSubAccount.value,
        },
        'apiKey': userSelectedExchange.apiKey,
        'secret': userSelectedExchange.apiSecret,
        'enableRateLimit': true,
        'options': {
          'createMarketBuyOrderRequiresPrice': createMarketBuyOrderRequiresPrice,
        }
      });
      const response = await exchange.createOrder(order.symbolPair, formattedType, formattedSide, order.amount, order.price);
      if (!response) {
        res.code(204).send();
      } else {
        return res.send({ response });
      }
    } catch(error) {
      console.log(error);
      return res.send({ error });
    }
  } else {
    res.code(400).send(respond("`Exchange name cannot be null.`", true, 400));
  }
}

export const cancelOrder = async (req: FastifyRequest, res: FastifyReply) => {
  let createMarketBuyOrderRequiresPrice = true;
  let userSubAccount: IExtraApiKeyFields = { 
    fieldName: '', 
    value: ''
  }

  const { exchangeName, orderId, walletId } = req.params as any;
  const formattedExchangeName = exchangeName.toLowerCase();

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const clt = new DepoUserController();
      const userAPIKeys = await clt.getUserApiKeys(walletId);
      const userSelectedExchange = userAPIKeys.find(exchangeItem => exchangeItem.id.toLowerCase() === formattedExchangeName);
      if (formattedExchangeName === 'huobi') {
        createMarketBuyOrderRequiresPrice = false;
      } 
    
      if (userSelectedExchange.id.toLowerCase() === 'ftx' && userSelectedExchange.extraFields.length > 0) {
        userSubAccount = userSelectedExchange.extraFields.find(field => field.fieldName === 'Subaccount');
      }
    
      if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
          const exchange = new ccxt[formattedExchangeName]({
            'headers': {
              'FTX-SUBACCOUNT': userSubAccount.value,
            },
            'apiKey': userSelectedExchange.apiKey,
            'secret': userSelectedExchange.apiSecret,
            'enableRateLimit': true,
            'options': {
              'createMarketBuyOrderRequiresPrice': createMarketBuyOrderRequiresPrice,
            }
          });

        const response = await exchange.cancelOrder(orderId);
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
