import { build } from "../../helper";

let app = build();

test("getUserCexBalance API test [GET] [/cexOpenOrders/:walletId]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/user/cexOpenOrders/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  expect(res.statusCode).toEqual(200);
});