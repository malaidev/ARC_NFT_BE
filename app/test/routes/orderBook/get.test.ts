import { build } from "../../helper";

let app = build();

test("loadUserOrders API test [GET] [/:walletId/:marketType/:symbol]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/ordersBook/0x4a5142af545693dc7ab66bcdc07c8e02cd58841f/future/FIL_CW-undefined",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    },
  });
   expect(res.statusCode).toEqual(200);
});