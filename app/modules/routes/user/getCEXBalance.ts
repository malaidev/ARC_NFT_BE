import * as ccxt from "ccxt";
import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from "../../controller/DepoUserController";

const getUsdtValue = async (exchangeName, formatedMarket) => {
  const exchange = new ccxt[exchangeName]();
  const response = await exchange.fetchMarkets();

  const allMarkets = await exchange.loadMarkets();

  const formatedSymbols = formatedMarket.map((quote) => {
    const symbol = `${quote.symbol}/USDT`;
    const formattedSymbol = `${quote.symbol}/USD`;
    const invertedSymbol = `USDT/${quote.symbol}`;
    const invertedFormattedSymbol = `USD/${quote.symbol}`;

    const realSymbol = allMarkets[symbol]
      ? symbol
      : allMarkets[formattedSymbol]
      ? formattedSymbol
      : allMarkets[invertedSymbol]
      ? invertedSymbol
      : allMarkets[invertedFormattedSymbol]
      ? invertedFormattedSymbol
      : undefined;

    return realSymbol;
  });

  if (exchangeName === "huobi") await exchange.fetchTicker("ETH/USDT");

  const allTickers = await exchange.fetchTickers(formatedSymbols);

  Object.keys(allTickers).forEach((base) => {
    const filterBy =
      base.split("/")[0] === "USDT" || base.split("/")[0] === "USD"
        ? base.split("/")[1]
        : base.split("/")[0];

    const exists = formatedMarket.find((item) => item.symbol === filterBy);
    if (exists) {
      const [auxBase, _] =
        exists.symbol.indexOf("/") !== -1
          ? exists.symbol.split("/")
          : exists.symbol.split("-");

      const lastPrice = allTickers[base].info.lastPrice
        ? +allTickers[base].info.lastPrice
        : +allTickers[base].last;

      const realPrice =
        auxBase === "USDT" || auxBase === "USD"
          ? +exists.amount / +lastPrice
          : +exists.amount * +lastPrice;

      exists.usdValue = realPrice;
    }
  });
  return formatedMarket;
};

const getBinanceBalance = async (userData, marketType) => {
  const exchange = new ccxt.binance();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.options.defaultType = marketType;
  await exchange.checkRequiredCredentials(); // throw AuthenticationError
  const responseBalance = await exchange.fetchBalance();
  const userSymbols = Object.keys(responseBalance["total"]).filter(
    (item) => responseBalance["total"][item] !== 0
  );
  const responseSymbol = userSymbols.map((symbol) => ({
    exchange: "binance",
    symbol,
    amount: +responseBalance["total"][symbol],
    usdValue: symbol === "USDT" ? +responseBalance["total"][symbol] : 0,
    availableValue: +responseBalance["free"][symbol],
  }));

  const responseFormated = await getUsdtValue("binance", responseSymbol);
  return responseFormated;
};

const getHuobiBalance = async (userData, marketType) => {
  const exchange = new ccxt.huobi();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.options.defaultType = marketType;
  await exchange.checkRequiredCredentials(); // throw AuthenticationError
  const responseBalance = await exchange.fetchBalance();

  const userSymbols = Object.keys(responseBalance["total"]).filter(
    (item) => responseBalance["total"][item] !== 0
  );
  const responseSymbol = userSymbols.map((symbol) => ({
    exchange: "huobi",
    symbol,
    amount: +responseBalance["total"][symbol],
    usdValue: symbol === "USDT" ? +responseBalance["total"][symbol] : 0,
    availableValue: +responseBalance["free"][symbol],
  }));

  const responseFormated = await getUsdtValue("huobi", responseSymbol);
  return responseFormated;
};

const getFtxBalance = async (userData, marketType) => {
  const exchange = new ccxt.ftx();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.options.defaultType = marketType;
  // config for subaccounts
  // exchange.headers = {
  // 'FTX-SUBACCOUNT': 'depo_test',
  // }

  if (userData.extraFields.length > 0) {
    const userSubAccount = userData.extraFields?.find(
      (field) => field.fieldName === "Subaccount"
    );
    if (userSubAccount) {
      exchange.headers = {
        "FTX-SUBACCOUNT": userSubAccount.value,
      };
    }
  }

  await exchange.checkRequiredCredentials(); // throw AuthenticationError
  const responseBalance = await exchange.fetchBalance();

  const responseSymbol = responseBalance.info.result.map((symbol) => ({
    exchange: "ftx",
    symbol: symbol.coin,
    amount: +symbol.total,
    usdValue: +symbol.usdValue,
    availableValue: symbol.free,
  }));

  return responseSymbol;
};

const getKucoinBalance = async (userData, marketType) => {
  const exchange = new ccxt.kucoin();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.password = userData.passphrase;
  exchange.options.defaultType = marketType;
  await exchange.checkRequiredCredentials(); // throw AuthenticationError

  const responseBalance = await exchange.fetchBalance();
  const userSymbols = Object.keys(responseBalance["total"]).filter(
    (item) => responseBalance["total"][item] !== 0
  );
  const responseSymbol = userSymbols.map((symbol) => ({
    exchange: "kucoin",
    symbol,
    amount: +responseBalance["total"][symbol],
    usdValue: symbol === "USDT" ? +responseBalance["total"][symbol] : 0,
    availableValue: +responseBalance["free"][symbol],
  }));

  const responseFormated = await getUsdtValue("kucoin", responseSymbol);
  return responseFormated;
};

const getGateioBalance = async (userData, marketType) => {
  const exchange = new ccxt.gateio();
  exchange.apiKey = userData.apiKey;
  exchange.secret = userData.apiSecret;
  exchange.options.defaultType = marketType === "future" ? "swap" : marketType;
  await exchange.checkRequiredCredentials(); // throw AuthenticationError
  const responseBalance = await exchange.fetchBalance();
  const userSymbols = Object.keys(responseBalance["total"]).filter(
    (item) => responseBalance["total"][item] !== 0
  );
  const responseSymbol = userSymbols.map((symbol) => ({
    exchange: "gate.io",
    symbol,
    amount: +responseBalance["total"][symbol],
    usdValue: symbol === "USDT" ? +responseBalance["total"][symbol] : 0,
    availableValue: +responseBalance["free"][symbol],
  }));

  const responseFormated = await getUsdtValue("binance", responseSymbol);
  return responseFormated;
};

export const getUserCexBalance = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  const { walletId, marketType } = req.params as any;

  const userController = new DepoUserController();
  const userExchanges: any = await userController.getUserApiKeys(walletId);

  if (!userExchanges) return res.send({});

  const response = {
    symbols: [],
    uniqueSymbols: [],
    walletValue: 0,
  };

  if (
    userExchanges.find((exchange) => exchange.id.toLowerCase() === "binance")
  ) {
    const binanceResponse = await getBinanceBalance(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "binance"),
      marketType
    );

    if (binanceResponse) {
      response.symbols.push(...binanceResponse);
    }
  }

  if (userExchanges.find((exchange) => exchange.id.toLowerCase() === "huobi")) {
    const responseHuobi = await getHuobiBalance(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "huobi"),
      marketType
    );

    if (responseHuobi) {
      response.symbols.push(...responseHuobi);
    }
  }

  if (userExchanges.find((exchange) => exchange.id.toLowerCase() === "ftx")) {
    const responseFTX = await getFtxBalance(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "ftx"),
      marketType
    );

    if (responseFTX) {
      response.symbols.push(...responseFTX);
    }
  }

  if (
    userExchanges.find((exchange) => exchange.id.toLowerCase() === "kucoin")
  ) {
    const responseKucoin = await getKucoinBalance(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "kucoin"),
      marketType
    );

    if (responseKucoin) {
      response.symbols.push(...responseKucoin);
    }
  }

  if (
    userExchanges.find((exchange) => exchange.id.toLowerCase() === "gateio")
  ) {
    const gateioResponse = await getGateioBalance(
      userExchanges.find((exchange) => exchange.id.toLowerCase() === "gateio"),
      marketType
    );

    if (gateioResponse) {
      response.symbols.push(...gateioResponse);
    }
  }

  response.symbols.forEach((symbol) => {
    response.walletValue += +symbol.usdValue;
    const existIndx = response.uniqueSymbols.findIndex(
      (item) => item.symbol === symbol.symbol
    );
    if (existIndx === -1) {
      return response.uniqueSymbols.push({ ...symbol });
    } else {
      response.uniqueSymbols[existIndx].amount += +symbol.amount;
      response.uniqueSymbols[existIndx].usdValue += +symbol.usdValue;
      response.uniqueSymbols[existIndx].availableValue =
        +response.uniqueSymbols[existIndx].availableValue +
        +symbol.availableValue;
    }
  });

  response.walletValue = +response.walletValue.toFixed(2);

  return res.send({ response });
};
