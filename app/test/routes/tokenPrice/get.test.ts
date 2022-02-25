import { build } from "../../helper";

let app = build();
jest.setTimeout(100000)
test("getTokenUsdtPrice API test [GET] [/:symbol/:address]", async () => {
    const res = await app.inject({
        method: 'GET',
        url: "http://localhost:3001/ws/v2/tokenPrice/USDT/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F",
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
    expect(res.statusCode).toEqual(200);
});

test("getTokenUsdtPrice API test [GET] [/:symbol]", async () => {
    const res = await app.inject({
        method: 'GET',
        url: "http://localhost:3001/ws/v2/tokenPrice/ETH",
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
    expect(res.statusCode).toEqual(200);
});

test("getTokenUsdtPrice API test [POST] [/]", async () => {
    const res = await app.inject({
        method: 'POST',
        url: "http://localhost:3001/ws/v2/tokenPrice/",
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        payload:{
            quotes: ["USDT"],
            addresses: ["0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F"],
        }
    });
    expect(res.statusCode).toEqual(200);
});

