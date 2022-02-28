import { build } from "../../helper";

let app = build();

//market type : binance,huobi,ftx,ftx,gateio
test("getUserCexBalance API test [GET] [/cexBalance/:walletId/:marketType]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/user/cexBalance/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/binance",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  expect(res.statusCode).toEqual(200);
});