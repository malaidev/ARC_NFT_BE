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
  const formattedSymbol = order.symbolPair.replace('-', '/');
  const clt = new DepoUserController();
  const userAPIKeys = await clt.getUserApiKeys(order.user.settings.defaultWallet);
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
      const response = await exchange.createOrder(formattedSymbol, formattedType, formattedSide, order.amount, order.price);
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
  const { exchangeName, orderId } = req.params as any;
  const formattedExchangeName = exchangeName.toLowerCase();
  console.log('veio');

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const exchange = new ccxt[formattedExchangeName]();
      const response = await exchange.cancelOrder(orderId);
      if (!response) {
        res.code(204).send();
      } else {
        return res.send({ response });
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.code(400).send(respond("`Exchange name cannot be null.`", true, 400));
  }
}
