import { build } from "../../helper";

let app = build();

jest.setTimeout(100000)
test("loadMarketDetails API test [POST] [/compare]", async () => {
    const res = await app.inject({
        method: 'POST',
        url: "http://localhost:3001/ws/v2/marketDetails/compare",
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        payload: {
            marketType: "future",
            symbol: "FIL_CW-undefined",
            type: "maker",
            userPriceUnit: "100",
            userSize: "1",
        }
    });
    expect(res.statusCode).toEqual(200);
});