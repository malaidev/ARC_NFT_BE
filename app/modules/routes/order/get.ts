import * as ccxt from 'ccxt';
import { FastifyReply, FastifyRequest } from "fastify";
import { IOrder } from '../../interfaces/IOrder';
import { respond } from "../../util/respond";

export const sendOrder = async (req: FastifyRequest, res: FastifyReply) => {
  const order: IOrder = req.body;
  const { exchangeName } = req.params as any;
  const formattedExchangeName = exchangeName.toLowerCase();
  const formattedType = order.orderType.toLowerCase();
  const formattedSide = order.offerType.toLowerCase();
  const user = order.user.details.exchanges.find(exchange => exchange.id.toLowerCase() === formattedExchangeName);

  if(ccxt[formattedExchangeName] && typeof ccxt[formattedExchangeName] === 'function' ){
    try {
      const exchange = new ccxt[formattedExchangeName]({
        'apiKey': user.apiKey,
        'secret': user.apiSecret,
        'enableRateLimit': true,
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
  const { exchangeName, orderId } = req.params as any;
  const formattedExchangeName = exchangeName.toLowerCase();

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
