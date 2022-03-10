import { build } from "../../helper";

let app = build();
const walletId = '0xdf3238e8ca04c0c5dc9520ccadd69993802161c7';



//create onwer

/**
 * Test 
 *  if user exists will return 501 and message "current user has been created"
 * 
 */
test("Create API test [POST] [/nft/owners/:ownerId]", async () => {
  const res = await app.inject({
    method: 'POST',
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

  
  let resBody = JSON.parse(res.body);
  console.log(resBody);
  if (!resBody.success){
    expect(resBody.code).toEqual(501);
  };
  if (resBody.success){
    expect(resBody.code).toEqual(200);
  }
  
});
 

 


//update favourite

/**
 * Test 
 *  if user exists will return 501 and message "current user has been created"
 * 
 */
 test("Create API test [POST] [/nft/favourite/:ownerId/:contract/:nftid]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: `http://localhost:3001/ws/v2/nft/favourite/${walletId}/1234/12344`,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    
  });

  
  let resBody = JSON.parse(res.body);
  if (!resBody.success){
    expect(resBody.code).toEqual(501);
  };
  if (resBody.success){
    expect(resBody.code).toEqual(200);
  }
  
});
 

 
