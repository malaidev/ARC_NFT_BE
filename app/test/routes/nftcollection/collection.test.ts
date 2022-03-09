import { build } from "../../helper";

let app = build();

const contract = '0xbb6a549b1cf4b2d033df831f72df8d7af4412a82';
const owner = '0x9451B75Ad222D6D808c925598Cb9deCEE4F26224';

//get items - no collection
test("getItems API test [GET] [/collection/:contract/items]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/nft/collection/NO_COLLECTION/items",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
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
test("Create Collection API test [POST] [/collection/:collectionId/create]", async () => {
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

//get items - no collection
test("getItems API test [GET] [/collection/:contract/items]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: `http://localhost:3001/ws/v2/nft/collection/${contract}/items`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  console.log(res.body);
  expect(res.statusCode).toEqual(200);

  const result = JSON.parse(res.body);
  if (result.code) {
    expect(JSON.parse(res.body).code).toEqual(422);
  } else {
    console.log(result.length);
  }
});


//place bid on
test("placeBid API test [GET] [/collection/placeBid]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: `http://localhost:3001/ws/v2/nft/collection/placeBid`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    payload: {
      contract: contract,
      nftId: '1',
      from: owner,
      price: 1,
      type: 'Bid'
    }
  });
  console.log(JSON.parse(res.body));
  expect(res.statusCode).toEqual(200);
});
