import { build } from "../../helper";

let app = build();
jest.setTimeout(100000)
test("emailContact API test [post] [/]", async () => {
  const res = await app.inject({
    method: 'POST',
    url: "http://localhost:3001/ws/v2/emailContact/",
    headers : {
        'Access-Control-Allow-Origin' : '*',
    },
    payload : {
        configEmail : "Partnership",
    }
  });
   expect(res.statusCode).toEqual(200);
});