import { build } from "../../helper";

let app = build();

test("getLog API test [GET] [/]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/log",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  expect(res.statusCode).toEqual(200);
});