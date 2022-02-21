import { build } from "../../helper";

const app = build();

test("getall", async () => {
  const res = await app.inject({
    method: 'get',
    url: "http://localhost:3001/ws/v2/test",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    }
  });
  console.log(res.json());
  expect(res.json()).toEqual({ hello : 'Test GET getAll'  });
});

test("getbyId", async () => {
  const res = await app.inject({
    method: 'get',
    url: "http://localhost:3001/ws/v2/test/123",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    }
  });
  console.log(res.json());
  expect(res.json()).toEqual({ hello : 'Test GET getId' });
});

test("findId", async () => {
  const res = await app.inject({
    method: 'post',
    url: "http://localhost:3001/ws/v2/test/",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    }
  });
  console.log(res.json());
  expect(res.json()).toEqual({ hello: 'Test post getId' });
});

test("update", async () => {
  const res = await app.inject({
    method: 'put',
    url: "http://localhost:3001/ws/v2/test/:getId=123",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    }
  });
  console.log(res.json());
  expect(res.json()).toEqual({ hello: 'Test put' });
});

test("delete", async () => {
  const res = await app.inject({
    method: 'delete',
    url: "http://localhost:3001/ws/v2/test/:getId=123",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    }
  });
  console.log(res.json());
  expect(res.json()).toEqual({ hello: 'Test delete' });
});