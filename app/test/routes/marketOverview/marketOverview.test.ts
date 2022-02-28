import { build } from "../../helper";

let app = build();
jest.setTimeout(300000)
test("loadMarketOverview API test [GET] [/spot/:exchangeName/:quote]", async () => {
    const res = await app.inject({
        method: 'GET',
        url: "http://localhost:3001/ws/v2/mktOverview/spot/Huobi/BTC",
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
    expect(res.statusCode).toEqual(200);
});

test("loadMarketOverviewFuture API test [GET] [/future/:exchangeName/:quote]", async () => {
    const res = await app.inject({
        method: 'GET',
        url: "http://localhost:3001/ws/v2/mktOverview/future/Huobi/USDT",
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
    expect(res.statusCode).toEqual(200);
});

test("loadSymbolOverview API test [GET] [/overview/:type/:symbol]", async () => {
    const res = await app.inject({
        method: 'GET',
        url: "http://localhost:3001/ws/v2/mktOverview/overview/future/FIL_CW-undefined",
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
    expect(res.statusCode).toEqual(200);
});


// Front end API NOT!
test("fetchGateioMarketCandlesticks API test [GET] [/candlesticks/gateio/:currency_pair]", async () => {
    const res = await app.inject({
        method: 'GET',
        url: "http://localhost:3001/ws/v2/mktOverview/candlesticks/gateio/FNT_STAKE",
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
    expect(res.statusCode).toEqual(200);
});