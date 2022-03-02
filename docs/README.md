# API List
The following tables list the API for BE

## Contract API
* Url http://localhost:3001/ws/v2/sign/
* Method : POST
* Sample payload
```
    {
      address: "0x4a5142af545693dc7ab66bcdc07c8e02cd58841f",
      commodity_amount: "268777.77779279",
    }
```
* Response : 200 

## Email Contact API
* Url http://localhost:3001/ws/v2/emailContact/
* Method POST
* Sample payload
```
    {
        configEmail : "Partnership",
    }
```
* Response : 200 
## Log API
* Url http://localhost:3001/ws/v2/log
* Method GET
* Response : 200

* URL http://localhost:3001/ws/v2/log/
* Method DELETE
* Response 204

## Market API
### GetMarketBySymbol API
* Url http://localhost:3001/ws/v2/market/Huobi/FIL_CW-undefined
* Method GET 
* Response : 200 

### getAllMarketsBySymbol API
* Url http://localhost:3001/ws/v2/market/allmarkets/FIL_CW-undefined/future
* Method GET 
* Response : 200 

## Market Details
### CompareExchangesOperation API
* http://localhost:3001/ws/v2/marketDetails/Huobi/FIL_CW-undefined
* Method GET
* Response : 200 

### LoadAllExchangesOrderBook API
* Url:  http://localhost:3001/ws/v2/marketDetails/orderBook/future/FIL_CW-undefined
* method: GET
* Response : 200 

### LoadMarketDetails API
* url:  http://localhost:3001/ws/v2/marketDetails/compare
* method: POST
* Sample payload
```     {
            marketType: "future",
            symbol: "FIL_CW-undefined",
            type: "maker",
            userPriceUnit: "100",
            userSize: "1",
        }
```        
* Response : 200 

## Market Overview
### LoadMarketOverview API
* url:  http://localhost:3001/ws/v2/mktOverview/spot/Huobi/BTC
* method: GET
* Response : 200  
### loadMarketOverviewFuture API
* url:  http://localhost:3001/ws/v2/mktOverview/future/Huobi/USDT
* method: GET
* Response : 200 
### loadSymbolOverview API
* url:  http://localhost:3001/ws/v2/mktOverview/overview/future/FIL_CW-undefined
* method: GET
* Response : 200 
### fetchGateioMarketCandlesticks API
* url:  http://localhost:3001/ws/v2/mktOverview/candlesticks/gateio/FNT_STAKE
* method: GET
* Response : 200 

## Order
## SendOrder API 
* url:  http://localhost:3001/ws/v2/order/gateio
* method: POST
* Sample payload
```     {
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
```      
* Response : 200 
### CancelOrder API
* url:  http://localhost:3001/ws/v2/order/cancel/:walletId/:exchangeName/:orderId/:symbol"
* method: POST
* Sample payload
```     //data
```      
* Response : 200 





