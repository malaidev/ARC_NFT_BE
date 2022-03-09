import { build } from "../../helper";

let app = build();

const contract = '0xbb6a549b1cf4b2d033df831f72df8d7af4412a82';
const owner = '0x9451B75Ad222D6D808c925598Cb9deCEE4F26224';
const creator = '0x9451B75Ad222D6D808c925598Cb9deCEE4F26224';
const other = '0x101c53F64Fe67ff8D88c52bD48080CaF1F43aB41';

// //get owners - no collection
// test("getItemDetail API test [GET] [/items/:contract/:nftId/detail]", async () => {
//   const res = await app.inject({
//     method: 'GET',
//     url: "http://localhost:3001/ws/v2/nft/items/NO_CONTRACT/1/detail",
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     }
//   });
//   console.log(JSON.parse(res.body));
//   expect(res.statusCode).toEqual(200);
//   expect(JSON.parse(res.body).code).toEqual(422);
// });

// //get all items
// test("getAllItems API test [GET] [/items]", async () => {
//   const res = await app.inject({
//     method: 'GET',
//     url: "http://localhost:3001/ws/v2/nft/items",
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     }
//   });
//   expect(res.statusCode).toEqual(200);
// });

// //get histories - no collection
// test("getHistory API test [GET] [/items/:contract/:nftId/history]", async () => {
//   const res = await app.inject({
//     method: 'GET',
//     url: "http://localhost:3001/ws/v2/nft/items/NO_COLLECTION/1/history",
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     }
//   });
//   console.log(JSON.parse(res.body));
//   expect(res.statusCode).toEqual(200);
//   expect(JSON.parse(res.body).code).toEqual(422);
// });


// //create collection
// test("create item API test [POST] [/items/create]", async () => {
//   const res = await app.inject({
//     method: 'POST',
//     url: "http://localhost:3001/ws/v2/nft/items/create",
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     },
//     payload: {
//       contract:contract,
//       nftId: '1',
//       artURI: 'https://arweave.net/EageoRV3AgHfeibDdt7j0XkmBw0FFRVILcpTfqocEFA?ext=png',
//       price: 1,
//       ownerAddr: owner,
//       creatorAddr: creator
//     }
//   });

//   expect(res.statusCode).toEqual(200);
//   expect(JSON.parse(res.body).code).not.toEqual(422);
// });

// //get item detail- with collection and nft info
// test("getItemDetail API test [GET] [/items/:contract/:nftId/detail]", async () => {
//   const res = await app.inject({
//     method: 'GET',
//     url: `http://localhost:3001/ws/v2/nft/items/${contract}/1/detail`,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     }
//   });
//   console.log(JSON.parse(res.body));
//   expect(res.statusCode).toEqual(200);
// });

// //get histories - with collection and nft info
// test("getHistory API test [GET] [/items/:contract/:nftId/history]", async () => {
//   const res = await app.inject({
//     method: 'GET',
//     url: `http://localhost:3001/ws/v2/nft/items/${contract}/1/history`,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//     }
//   });
//   console.log(JSON.parse(res.body));
//   expect(res.statusCode).toEqual(200);
// });

// transfer nft
test("transfer nft API test [GET] [/items/transfer]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: `http://localhost:3001/ws/v2/nft/items/transfer`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    payload: {
      contract: contract,
      nftId: '1',
      from: owner,
      to: other,
      transactionDate: new Date(),
      price: 1,
    }
  });
  console.log(JSON.parse(res.body));
  expect(res.statusCode).toEqual(200);
});