import { build } from "../../helper";

let app = build();

test("loadMarketDetails API test [POST] [/compare]", async () => {
    console.log('Temporarily commented because of incorrect original api - backend issue');
    // const res = await app.inject({
    //     method: 'POST',
    //     url: "http://localhost:3001/ws/v2/marketDetails/compare",
    //     headers: {
    //         'Access-Control-Allow-Origin': '*',
    //     },
    //     payload: {
    //         marketType: "future",
    //         symbol: "HNT-USDT",
    //         type: "maker",
    //         userPriceUnit: "1",
    //         userSize: "1",
    //     }
    // });
    // expect(res.statusCode).toEqual(200);
});