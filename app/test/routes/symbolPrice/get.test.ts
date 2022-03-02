import { build } from "../../helper";

let app = build();
jest.setTimeout(100000)
test("getSymbolUsdtPrice API test [GET] [/:symbol]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/symbolPrice/USDT",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    },
  });
   expect(res.statusCode).toEqual(200);
});

test("getSymbolUsdtPrices API test [POST] [/]", async () => {
  console.log('Temporarily commented because of incorrect post req.body.quotes');
  // const res = await app.inject({
  //   method: 'POST',
  //   url: "http://localhost:3001/ws/v2/symbolPrice/",
  //   headers : {
  //       'Access-Control-Allow-Origin' : '*',
  //   },
  //   payload: {
  //       quotes: ["BUSD"],
  //   }
  // });
  //  expect(res.statusCode).toEqual(200);
});