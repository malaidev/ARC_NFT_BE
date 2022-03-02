# API List
The following tables list the API for BE

## Contract API
* Url https://host:port/ws/v2/sign/
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
* Url https://host:port/ws/v2/emailContact/
* Method POST
* Sample payload
```
    {
        configEmail : "Partnership",
    }
```
* Response : 200 
## Log API
* Url https://host:port/ws/v2/log
* Method GET
* Response : 200

* URL https://host:port/ws/v2/log/
* Method DELETE
* Response 204

## Market API
### GetMarketBySymbol API
* Url https://host:port/ws/v2/market/Huobi/FIL_CW-undefined
* Method GET 
* Response : 200 

### getAllMarketsBySymbol API
* Url https://host:port/ws/v2/market/allmarkets/FIL_CW-undefined/future
* Method GET 
* Response : 200 

## Market Details
### CompareExchangesOperation API
* https://host:port/ws/v2/marketDetails/Huobi/FIL_CW-undefined
* Method GET
* Response : 200 

### LoadAllExchangesOrderBook API
* Url:  https://host:port/ws/v2/marketDetails/orderBook/future/FIL_CW-undefined
* method: GET
* Response : 200 

### LoadMarketDetails API
* url:  https://host:port/ws/v2/marketDetails/compare
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
* url:  https://host:port/ws/v2/mktOverview/spot/Huobi/BTC
* method: GET
* Response : 200  
### loadMarketOverviewFuture API
* url:  https://host:port/ws/v2/mktOverview/future/Huobi/USDT
* method: GET
* Response : 200 
### loadSymbolOverview API
* url:  https://host:port/ws/v2/mktOverview/overview/future/FIL_CW-undefined
* method: GET
* Response : 200 
### fetchGateioMarketCandlesticks API
* url:  https://host:port/ws/v2/mktOverview/candlesticks/gateio/FNT_STAKE
* method: GET
* Response : 200 

## Order
## SendOrder API 
* url:  https://host:port/ws/v2/order/gateio
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
* url:  https://host:port/ws/v2/order/cancel/:walletId/:exchangeName/:orderId/:symbol
* method: POST
* Sample payload
```     //data
```      
* Response : 200 

## Order Book
### loadUserOrders API
* url:  https://host:port/ws/v2/ordersBook/0x4a5142af545693dc7ab66bcdc07c8e02cd58841f/future/FIL_CW-undefined
* method: GET
* Response : 200 

## Pool
* url:  https://host:port/ws/v2/pool/1/uniswap-v2
* method: GET 
* Response : 200 

## SymbolPrice
### getSymbolUsdtPrice
* url:  https://host:port/ws/v2/pool/1/uniswap-v2
* method: GET 
* Response : 200 
### getSymbolUsdtPrice
* url:  https://host:port/ws/v2/symbolPrice/
* method: POST
* Sample payload
```    {
        quotes: ["FTX","Binance"],
    }
```   
* Response : 200

## TokenPrice
### getTokenUsdtPrice API  [GET]
* url:  https://host:port/ws/v2/tokenPrice/USDT/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F
* method: GET 
* Response : 200 
### getTokenUsdtPrice API  [GET]
* url:  https://host:port/ws/v2/tokenPrice/ETH
* method: GET 
* Response : 200 
### getTokenUsdtPrice API test [POST]
* url:  https://host:port/ws/v2/tokenPrice/
* method: POST
* Sample payload
```     {
            quotes: ["USDT"],
            addresses: ["0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F"],
        }
```   
* Response : 200

## User
### getUserCexBalance API
* url:  https://host:port/ws/v2/user/cexBalance/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/binance
* method: GET 
* Response : 200 
### getUserCexBalance API
* url:  https://host:port/ws/v2/user/cexOpenOrders/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F
* method: GET 
* Response : 200 
### getSigning API
* url:  https://host:port/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/auth-message
* method: GET 
* Response : 200 
### findOrCreateUser API
* url:  https://host:port/ws/v2/user/auth
* method: POST
* Sample payload
```  {
      walletId: testConfig.walletIdTest,
      signature : testConfig.signatureTest ,
    }
```    
* Response : 200 
 
### getAll API
* url:  https://host:port/ws/v2/user/
* method: GET 
* Response : 200 
### getOne API
* url:  https://host:port/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F
* method: GET 
* Response : 200 
 ### auth API
* url:  https://host:port/ws/v2/user/auth
* method: GET 
* Response : 204
### create API 
* url:  https://host:port/ws/v2/user/
* method: POST 
* Response : 200
### update API 
* url:  https://host:port/ws/v2/user/
* method: PUT 
* Sample payload
``` {
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
```
* Response : 200
### Delete API 
* url:  https://host:port/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/????/????
* method: DELETE 
* Response : 200