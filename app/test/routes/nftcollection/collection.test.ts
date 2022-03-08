import { build } from "../../helper";

let app = build();

const contract = '0xbb6a549b1cf4b2d033df831f72df8d7af4412a82';

//get items - no collection
test("getItems API test [GET] [/collection/:contract/items]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/items",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(res.body);
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).toEqual(422);
});

//get owners - no collection
test("getOwners API test [GET] [/collection/:contract/owners]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/owners",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(JSON.parse(res.body));
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).toEqual(422);
});

//get histories - no collection
test("getHistory API test [GET] [/collection/:contract/history]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/history",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(JSON.parse(res.body));
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).toEqual(422);
});

//get activities - no collection
test("getActivities API test [GET] [/collection/:contract/activity]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/activity",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(JSON.parse(res.body));
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).toEqual(422);
});


//create collection
test("getActivities API test [POST] [/collection/:collectionId/create]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: "http://localhost:3001/ws/v2/nft/collection/create",
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    payload: {
      contract:contract,
      name: 'test'
    }
  });
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).not.toEqual(422);
});
