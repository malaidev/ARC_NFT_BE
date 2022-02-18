import * as ccxt from "ccxt";
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from "../../controller/DepoUserController";
import { verifySymbolFormate } from "../../util/verifySymbolFormate";

const loadBinanceOrders = async (marketType, userData, symbol) => {
  try {
    const exchange = new ccxt.binance();
    exchange.options.defaultType = marketType;
    exchange.apiKey = userData.apiKey;
    exchange.secret = userData.apiSecret;
    await exchange.checkRequiredCredentials(); // throw AuthenticationError

    const realSymbol = await verifySymbolFormate("binance", marketType, symbol);

    if (realSymbol) {
      const responseBinance = {
        openOrders: await exchange.fetchOpenOrders(symbol),
        closedOrders: await exchange.fetchClosedOrders(symbol),
      };

      if (responseBinance.openOrders && responseBinance.closedOrders) {
        if (marketType === "future") {
          responseBinance.openOrders = responseBinance.openOrders.filter(
            (order: any) => order.info.future && order.info.future !== null
          );
          responseBinance.closedOrders = responseBinance.closedOrders.filter(
            (order: any) => order.info.future && order.info.future !== null
          );
        }

        responseBinance.openOrders.forEach((order: any) => {
          order.exchange = "Binance";
          order.info.status = order.status;
        });

        responseBinance.closedOrders.forEach((order: any) => {
          order.exchange = "Binance";
          order.info.status = order.status;
        });

        return responseBinance;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const loadHuobiOrders = async (marketType, userData, symbol) => {
  try {
    const exchange = new ccxt.huobi();
    exchange.options.defaultType = marketType;
    exchange.apiKey = userData.apiKey;
    exchange.secret = userData.apiSecret;
    await exchange.checkRequiredCredentials(); // throw AuthenticationError

    const realSymbol = await verifySymbolFormate("huobi", marketType, symbol);

    if (realSymbol) {
      const responseHuobi = {
        openOrders: await exchange.fetchOpenOrders(symbol),
        closedOrders: await exchange.fetchClosedOrders(symbol),
      };

      if (responseHuobi.openOrders && responseHuobi.closedOrders) {
        if (marketType === "future") {
          responseHuobi.openOrders = responseHuobi.openOrders.filter(
            (order: any) => order.info.future && order.info.future !== null
          );
          responseHuobi.closedOrders = responseHuobi.closedOrders.filter(
            (order: any) => order.info.future && order.info.future !== null
          );
        }

        responseHuobi.openOrders.forEach((order: any) => {
          order.exchange = "Huobi";
          order.info.status = order.status;
        });

        responseHuobi.closedOrders.forEach((order: any) => {
          order.exchange = "Huobi";
          order.info.status = order.status;
        });

        return responseHuobi;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const loadFTXOrders = async (marketType, userData, symbol) => {
  try {
    const exchange = new ccxt.ftx();
    exchange.options.defaultType = marketType;
    exchange.apiKey = userData.apiKey;
    exchange.secret = userData.apiSecret;

    if (userData.extraFields.length > 0) {
      const userSubAccount = userData.extraFields?.find(
        (field) => field.fieldName === "Subaccount"
      );
      if (userSubAccount) {
        exchange.headers["FTX-SUBACCOUNT"] = userSubAccount.value;
      }
    }

    await exchange.checkRequiredCredentials(); // throw AuthenticationError
    const orderList = await exchange.fetchOrders();

    const realSymbol = await verifySymbolFormate("ftx", marketType, symbol);

    if (realSymbol) {
      const responseFTX = {
        openOrders: orderList.filter(
          (order) =>
            order.info.status !== "closed" && order.symbol === realSymbol
        ),
        closedOrders: orderList.filter(
          (order) =>
            order.info.status === "closed" && order.symbol === realSymbol
        ),
      };

      if (responseFTX.openOrders && responseFTX.closedOrders) {
        if (marketType === "future") {
          responseFTX.openOrders = responseFTX.openOrders.filter(
            (order: any) => order.info.future && order.info.future !== null
          );
          responseFTX.closedOrders = responseFTX.closedOrders.filter(
            (order: any) => order.info.future && order.info.future !== null
          );
        }

        responseFTX.openOrders.forEach(
          (order: any) => (order.exchange = "FTX")
        );
        responseFTX.closedOrders.forEach(
          (order: any) => (order.exchange = "FTX")
        );

        return responseFTX;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const loadKucoinOrders = async (marketType, userData, symbol) => {
  try {
    const exchange = new ccxt.kucoin();
    exchange.options.defaultType = marketType;
    exchange.apiKey = userData.apiKey;
    exchange.secret = userData.apiSecret;
    exchange.password = userData.passphrase;

    await exchange.checkRequiredCredentials(); // throw AuthenticationError

    const realSymbol = await verifySymbolFormate("kucoin", marketType, symbol);
    if (realSymbol) {
      const responseKucoin = {
        openOrders: await exchange.fetchOpenOrders(symbol),
        closedOrders: await exchange.fetchClosedOrders(symbol),
      };

      if (responseKucoin.openOrders && responseKucoin.closedOrders) {
        if (marketType === "future") {
          responseKucoin.openOrders = responseKucoin.openOrders.filter(
            (order: any) => order.info.future && order.info.future !== null
          );
          responseKucoin.closedOrders = responseKucoin.closedOrders.filter(
            (order: any) => order.info.future && order.info.future !== null
          );
        }

        responseKucoin.openOrders.forEach((order: any) => {
          order.exchange = "Kucoin";
          order.info.status = order.status;
        });

        responseKucoin.closedOrders.forEach((order: any) => {
          order.exchange = "Kucoin";
          order.info.status = order.status;
        });

        return responseKucoin;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const loadGateioOrders = async (marketType, userData, symbol) => {
  try {
    const exchange = new ccxt.gateio();
    exchange.options.defaultType =
      marketType === "future" ? "swap" : marketType;
    exchange.apiKey = userData.apiKey;
    exchange.secret = userData.apiSecret;
    await exchange.checkRequiredCredentials(); // throw AuthenticationError

    const realSymbol = await verifySymbolFormate("gateio", marketType, symbol);

    if (realSymbol) {
      const responseGateio = {
        openOrders: await exchange.fetchOpenOrders(symbol),
        closedOrders: await exchange.fetchClosedOrders(symbol),
      };

      if (responseGateio.openOrders && responseGateio.closedOrders) {
        if (marketType === "future") {
          responseGateio.openOrders = responseGateio.openOrders.filter(
            (order: any) => order.info.swap && order.info.swap !== null
          );
          responseGateio.closedOrders = responseGateio.closedOrders.filter(
            (order: any) => order.info.swap && order.info.swap !== null
          );
        }

        responseGateio.openOrders.forEach((order: any) => {
          order.exchange = "Gate.io";
          order.info.status = order.status;
        });

        responseGateio.closedOrders.forEach((order: any) => {
          order.exchange = "Gate.io";
          order.info.status = order.status;
        });

        return responseGateio;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export const loadUserOrders = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const { walletId, marketType, symbol } = req.params as any;
    const formatedSymbol = symbol.replace("-", "/");
    const userController = new DepoUserController();
    const userExchanges: any = await userController.getUserApiKeys(walletId);
    const response = {
      openOrders: [],
      closedOrders: [],
    };

    if (!userExchanges) return res.send({});

    if (
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "binance")
    ) {
      const binanceResponse = await loadBinanceOrders(
        marketType,
        userExchanges.find(
          (exchange) => exchange.id.toLowerCase() === "binance"
        ),
        formatedSymbol
      );

      if (binanceResponse) {
        response.openOrders.push(...binanceResponse.openOrders);
        response.closedOrders.push(...binanceResponse.closedOrders);
      }
    }

    if (
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "huobi")
    ) {
      const responseHuobi = await loadHuobiOrders(
        marketType,
        userExchanges.find((exchange) => exchange.id.toLowerCase() === "huobi"),
        formatedSymbol
      );

      if (responseHuobi) {
        response.openOrders.push(...responseHuobi.openOrders);
        response.closedOrders.push(...responseHuobi.closedOrders);
      }
    }

    if (userExchanges.find((exchange) => exchange.id.toLowerCase() === "ftx")) {
      const responseFTX = await loadFTXOrders(
        marketType,
        userExchanges.find((exchange) => exchange.id.toLowerCase() === "ftx"),
        formatedSymbol
      );

      if (responseFTX) {
        response.openOrders.push(...responseFTX.openOrders);
        response.closedOrders.push(...responseFTX.closedOrders);
      }
    }

    if (
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "kucoin")
    ) {
      const responseKucoin = await loadKucoinOrders(
        marketType,
        userExchanges.find(
          (exchange) => exchange.id.toLowerCase() === "kucoin"
        ),
        formatedSymbol
      );

      if (responseKucoin) {
        response.openOrders.push(...responseKucoin.openOrders);
        response.closedOrders.push(...responseKucoin.closedOrders);
      }
    }

    if (
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "gateio")
    ) {
      const responseGateio = await loadGateioOrders(
        marketType,
        userExchanges.find(
          (exchange) => exchange.id.toLowerCase() === "gateio"
        ),
        formatedSymbol
      );

      if (responseGateio) {
        response.openOrders.push(...responseGateio.openOrders);
        response.closedOrders.push(...responseGateio.closedOrders);
      }
    }

    return res.send({ response });
  } catch (err) {
    console.log(err);
  }
};
