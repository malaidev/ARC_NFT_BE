import * as ccxt from "ccxt";
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from "../../controller/DepoUserController";

const loadBinanceOrders = async (userData) => {
  const exchange = new ccxt.binance();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.options["warnOnFetchOpenOrdersWithoutSymbol"] = false;
  await exchange.checkRequiredCredentials(); // throw AuthenticationError

  const openOrders = (await exchange.fetchOpenOrders()).map((order) => ({
    ...order,
    exchange: "binance",
  }));

  return openOrders;
};

const loadHuobiOrders = async (userData) => {
  const exchange = new ccxt.huobi({
    fetchOpenOrdersMethod: "fetch_open_orders_v2",
  });
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.options["warnOnFetchOpenOrdersWithoutSymbol"] = false;
  await exchange.checkRequiredCredentials(); // throw AuthenticationError
  // const openOrders = (await exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}))
  return;
};

const loadFtxOrders = async (userData) => {
  const exchange = new ccxt.ftx();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;

  const exchangeFuture = new ccxt.ftx({
    options: {
      defaultType: "future",
    },
  });
  exchangeFuture.apiKey = userData.apiKey;
  exchangeFuture.secret = userData.apiSecret;

  if (userData.extraFields.length > 0) {
    const userSubAccount = userData.extraFields.find(
      (field) => field.fieldName === "Subaccount"
    );
    if (userSubAccount) {
      exchange.headers = {
        "FTX-SUBACCOUNT": userSubAccount.value,
      };

      exchangeFuture.headers = {
        "FTX-SUBACCOUNT": userSubAccount.value,
      };
    }
  }

  await exchange.checkRequiredCredentials(); // throw AuthenticationError

  const openOrders = (await exchange.fetchOpenOrders()).map((order) => ({
    ...order,
    exchange: "ftx",
  }));
  const futureOrders = (await exchangeFuture.fetchOpenOrders()).map(
    (order) => ({ ...order, exchange: "ftx" })
  );
  return openOrders.concat(...futureOrders);
};

const loadKucoinOrders = async (userData) => {
  try {
    const exchange = new ccxt.kucoin();
    exchange.apiKey = userData.apiKey;
    exchange.secret = userData.apiSecret;
    exchange.password = userData.passphrase;

    await exchange.checkRequiredCredentials(); // throw AuthenticationError

    const openOrders = (await exchange.fetchOpenOrders()).map((order) => ({
      ...order,
      exchange: "kucoin",
    }));

    return openOrders;
  } catch (err) {
    console.log(err);
  }
};

const loadGateioOrders = async (userData) => {
  try {
    const exchange = new ccxt.gateio();
    exchange.apiKey = userData.apiKey;
    exchange.secret = userData.apiSecret;

    await exchange.checkRequiredCredentials(); // throw AuthenticationError

    const openOrders = (await exchange.fetchOpenOrders()).map((order) => ({
      ...order,
      exchange: "gate.io",
    }));

    return openOrders;
  } catch (err) {
    console.log(err);
  }
};

export const getUserAllOpenOrders = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { walletId } = req.params as any;

  const userController = new DepoUserController();
  const userExchanges: any = await userController.getUserApiKeys(walletId);

  if (!userExchanges) return res.send({});

  const response = [];

  if (
    userExchanges.find((exchange) => exchange.id.toLowerCase() === "binance")
  ) {
    const binanceResponse = await loadBinanceOrders(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "binance")
    );

    if (response) {
      response.push(...binanceResponse);
    }
  }

  // if(userExchanges.find(exchange => exchange.id.toLowerCase() === 'huobi' )){
  //   const responseHuobi = await loadHuobiOrders(userExchanges.find(exchange => exchange.id.toLowerCase() === 'huobi'))

  //   if(responseHuobi){
  //     orders.push(...responseHuobi);
  //   }
  // }

  if (userExchanges.find((exchange) => exchange.id.toLowerCase() === "ftx")) {
    const responseFTX = await loadFtxOrders(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "ftx")
    );

    if (responseFTX) {
      response.push(...responseFTX);
    }
  }

  if (
    userExchanges.find((exchange) => exchange.id.toLowerCase() === "kucoin")
  ) {
    const responseKucoin = await loadKucoinOrders(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "kucoin")
    );

    if (responseKucoin) {
      response.push(...responseKucoin);
    }
  }

  if (
    userExchanges.find((exchange) => exchange.id.toLowerCase() === "gateio")
  ) {
    const responseGateio = await loadGateioOrders(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "gateio")
    );

    if (responseGateio) {
      response.push(...responseGateio);
    }
  }

  response.forEach(
    (symbol) => (symbol.total_price = +symbol.price * +symbol.amount)
  );

  return res.send({ response });
};
