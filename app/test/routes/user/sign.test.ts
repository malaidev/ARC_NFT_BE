import { build } from "../../helper";
// import { build } from "../../helper_jwt";
import { testConfig } from '../../testConfig'

let app = build();

test("getSingingMessage API test [GET] [/:walletId/auth-message]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/auth-message",
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  });
  testConfig.messageTest = res.json().message;
  testConfig.timestampTest = res.json().timestamp;
  expect(res.json().message).toHaveLength;
  expect(res.json().timestamp).toHaveLength;
});

test("findOrCreateUser API Test [POST] [/auth]", async () => {

  const res = await app.inject({
    method: 'POST',
    url: 'http://localhost:3001/ws/v2/user/auth',    
    payload: {
      walletId: testConfig.walletIdTest,
      signature : testConfig.signatureTest ,
    }
  });
  expect(res.statusCode).toEqual(200);
});

test("getAll API test [GET] [/]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/user/",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    },
  });
   expect(res.json()).toHaveReturned;
});

test("getOne API Test [GET] [/:walletId]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    },
  });
  expect(res.json().settings).toHaveLength;
  expect(res.json().wallets).toHaveLength;
  expect(res.json().date).toHaveLength;
});

test("auth API Test [GET] [/auth]", async () => {
  const res = await app.inject({
    method: 'GET',
    url: "http://localhost:3001/ws/v2/user/auth",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    },
  });
  expect(res.statusCode).toEqual(204);
});

test("create API Test [POST] [/]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: "http://localhost:3001/ws/v2/user/",
    headers: {
      'Access-Control-Allow-Origin': '*',
    },    
  });
  expect(res.statusCode).toEqual(200);
});

test("update API Test [POST] [/]", async () => {
  const res = await app.inject({
    method: 'PUT',
    url: "http://localhost:3001/ws/v2/user/",
    headers: {
      'Access-Control-Allow-Origin': '*',
    },    
    payload: {
      _id: testConfig.idTest,
      name: testConfig.nameTest,
      createdAt: testConfig.createAtTest,
      wallets: testConfig.walletIdTest,
      settings: testConfig.settingTest,
      lastLogin: testConfig.lastloginTest,
      exchanges: testConfig.exchangesTest,
      authorizedBrowsers: testConfig.authorizedBrowsersTest,
      liquidityProvisions: testConfig.liquidityProvisionsTest,
    }
  });
  expect(res.statusCode).toEqual(200);
});

test("delete API Test [DELETE] [/:walletId/:exchangeId/:apiKey]", async () => {
  const res = await app.inject({
    method: 'DELETE',
    url: "http://localhost:3001/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/????/????",
    headers: {
      'Access-Control-Allow-Origin': '*',
    },    
  });
  expect(res.statusCode).toEqual(200);
});

