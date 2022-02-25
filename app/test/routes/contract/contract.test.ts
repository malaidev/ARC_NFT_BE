import { build } from "../../helper";

let app = build();
jest.setTimeout(100000)
test("contract API test [POST] [/]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: "http://localhost:3001/ws/v2/sign/",
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    payload: {
      address: "0x4a5142af545693dc7ab66bcdc07c8e02cd58841f",
      commodity_amount: "268777.77779279",
    }
  });
  expect(res.statusCode).toEqual(200);
});