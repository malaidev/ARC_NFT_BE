import { build } from "../../helper";
let app = build();
jest.setTimeout(100000)
const walletId = '0xdf3238e8ca04c0c5dc9520cca9993802161c7';
//update onwer 
test("Update  API test [PUT] [/nft/owners/:ownerId]", async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `http://localhost:3001/ws/v2/nft/owners/${walletId}`,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      payload: {
          "backgroundUrl": "http://testing-2.io",
          "photoUrl": "http://x12.io",
         "joinedDate": "03-03-2020",
         "name":"Test Name"
      }
    });
    const resBody = JSON.parse(res.body);
    if (resBody.success){
        expect(resBody.code).toEqual(200);
    }
    if (!resBody.success){
        expect(resBody.code).toEqual(422);
    }
    // if (resBody.success){
    //     expect(resBody).toEqual(200);
    // }
    // if (!resBody.success){
    //     expect(resBody).toEqual(501);
    // }
  });
test("Update  failed API test [PUT] [/nft/owners/:ownerId]", async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `http://localhost:3001/ws/v2/nft/owners/1234`,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      payload: {
          "backgroundUrl": "http://testing-2.io",
          "photoUrl": "http://x12.io",
         "joinedDate": "03-03-2020",
         "name":"Test Name"
      }
    });
    console.log(res)
    const resBody = JSON.parse(res.body);
    console.log('---->>>>>>>>>>>>',resBody);
    if (!resBody.success){
        expect(resBody.code).toEqual(422);
    }
    // if (resBody.success){
    //     expect(resBody).toEqual(200);
    // }
    // if (!resBody.success){
    //     expect(resBody).toEqual(501);
    // }
  });
