import { build } from "../../helper";

let app = build();

//get items - no collection
test("getItems API test [GET] [/collection/:collectionId/items]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/items",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(res);
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).toEqual(422);
});

//get owners - no collection
test("getOwners API test [GET] [/collection/:collectionId/owners]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/owners",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(res);
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).toEqual(422);
});

//get histories - no collection
test("getHistory API test [GET] [/collection/:collectionId/history]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/history",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(res);
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).toEqual(422);
});

//get activities - no collection
test("getActivities API test [GET] [/collection/:collectionId/activity]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/activity",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(res);
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).toEqual(422);
});

