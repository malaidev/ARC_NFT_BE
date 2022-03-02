import { build } from "../../helper";

let app = build();

test("clearLog API test [DELETE] [/]", async () => {
  const res = await app.inject({
    method: 'DELETE',
    url: "http://localhost:3001/ws/v2/log/",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  expect(res.statusCode).toEqual(204);
});