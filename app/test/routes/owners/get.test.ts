import { build } from "../../helper";
let app = build();
const walletId = '0xdf3238e8ca04c0c5dc9520ccadd69993802161c7';
jest.setTimeout(100000)
test("get owners id API test [GET] [/nft/:ownerId]", async () => {
    const res = await app.inject({
      method: 'GET',
      url: `http://localhost:3001/ws/v2/nft/owners/${walletId}`,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    const resBody = JSON.parse(res.body);
    expect(res.statusCode).toEqual(200);
  });
test("get owners  id API test [GET] [/nft/:ownerId]", async () => {
    const res = await app.inject({
      method: 'GET',
      url: `http://localhost:3001/ws/v2/nft/owners/xxx`,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    const resBody = JSON.parse(res.body);
    expect(resBody.code).toEqual(422);
  });
test("get owners  NFTS id API test [GET] [/nft/:ownerId/nfts]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: `http://localhost:3001/ws/v2/nft/owners/${walletId}/nfts`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  const resBody = JSON.parse(res.body);
  expect(res.statusCode).toEqual(200);
});


test("get owners  History id API test [GET] [/nft/:ownerId/history]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: `http://localhost:3001/ws/v2/nft/owners/${walletId}/history`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  const resBody = JSON.parse(res.body);
  expect(res.statusCode).toEqual(200);
});
test("get owners  Collection id API test [GET] [/nft/:ownerId/collection]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: `http://localhost:3001/ws/v2/nft/owners/${walletId}/collection`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  const resBody = JSON.parse(res.body);
  expect(res.statusCode).toEqual(200);
});
