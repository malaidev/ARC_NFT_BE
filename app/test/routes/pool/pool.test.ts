import { build } from "../../helper";

let app = build();
jest.setTimeout(100000)
test("pool API test [GET] [/:chainId/:protocol]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/pool/1/uniswap-v2",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    },
  });
   expect(res.statusCode).toEqual(200);
});