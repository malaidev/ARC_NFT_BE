import { build } from "../../helper";

let app = build();

test("sendOrder API test [POST] [/:exchangeName]", async () => {
    const res = await app.inject({
        method: 'POST',
        url: "http://localhost:3001/ws/v2/order/gateio",
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        payload: {
            order: {
                symbolPair: "",
                orderType: "MARKET",
                offerType: "BUY",
                amount: "12344",
                price: 12344,
                exchangeName: "gateio",
                user: {
                    exchanges: [12312313, 12312312312],
                },
                marketType: "future",
            }
        }
    });
    expect(res.statusCode).toEqual(200);
});

test("sendCancelOrder API test [POST] [/cancel/:walletId/:exchangeName/:orderId/:symbol]", async () => {
    const res = await app.inject({
        method: 'POST',
        url: "http://localhost:3001/ws/v2/order/cancel/:walletId/:exchangeName/:orderId/:symbol",
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        payload: {
            //data
        }
    });
    expect(res.statusCode).toEqual(200);
});