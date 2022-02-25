import { build } from "../../helper";

let app = build();
jest.setTimeout(100000)
test("compareExchangesOperation API test [GET] [/:exchangeName/:symbol]", async () => {
    const res = await app.inject({
        method: 'GET',
        url: "http://localhost:3001/ws/v2/marketDetails/Huobi/FIL_CW-undefined",
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
    expect(res.statusCode).toEqual(200);
});

test("loadAllExchangesOrderBook API test [GET] [/orderBook/:marketType/:symbol]", async () => {
    const res = await app.inject({
        method: 'GET',
        url: "http://localhost:3001/ws/v2/marketDetails/orderBook/future/FIL_CW-undefined",
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
    expect(res.statusCode).toEqual(200);
});