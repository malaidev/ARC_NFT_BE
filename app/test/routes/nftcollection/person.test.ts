import { build } from "../../helper";

let app = build();

const owner = '0x9451B75Ad222D6D808c925598Cb9deCEE4F26224';
const other = '0x101c53F64Fe67ff8D88c52bD48080CaF1F43aB41';


//create person
test("Create Person API test [POST] [/owners/:ownerId]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: `http://localhost:3001/ws/v2/nft/owners/${owner}`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    payload: {
      backgroundUrl: 'test',
      photoUrl: 'test',
      joinedDate: new Date(),
      name: 'test'
    }
  });
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).not.toEqual(422);
});

//create person
test("Create Person API test [POST] [/owners/:ownerId]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: `http://localhost:3001/ws/v2/nft/owners/${other}`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    payload: {
      backgroundUrl: 'test',
      photoUrl: 'test',
      joinedDate: new Date(),
      name: 'test'
    }
  });
  expect(res.statusCode).toEqual(200);
  expect(JSON.parse(res.body).code).not.toEqual(422);
});