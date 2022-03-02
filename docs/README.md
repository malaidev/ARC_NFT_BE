# API List
The following tables list the API for BE

## Contract API
* Url : ```https://host:port/ws/v2/sign/```
* Method:   POST
* Sample payload :
```
    {
      address: "0x4a5142af545693dc7ab66bcdc07c8e02cd58841f",
      commodity_amount: "268777.77779279",
    }
```
* Response : 200 

## Email Contact API
* Url : ```https://host:port/ws/v2/emailContact/```
* Method:  POST
* Sample payload :
```
    {
        configEmail : "Partnership",
    }
```
* Response : 200 
## Log API
* Url : ```https://host:port/ws/v2/log```
* Method:  GET
* Response : 200

* Url : ```https://host:port/ws/v2/log/```
* Method:  DELETE
* Response 204

## Market API
### GetMarketBySymbol API
* Url : ```https://host:port/ws/v2/market/Huobi/FIL_CW-undefined```
* Method:  GET 
* Response : 200 

### GetAllMarketsBySymbol API
* Url : ```https://host:port/ws/v2/market/allmarkets/FIL_CW-undefined/future```
* Method:  GET 
* Response : 200 

## Market Details
### CompareExchangesOperation API
* ```https://host:port/ws/v2/marketDetails/Huobi/FIL_CW-undefined```
* Method:  GET
* Response : 200 

### LoadAllExchangesOrderBook API
* Url :   ```https://host:port/ws/v2/marketDetails/orderBook/future/FIL_CW-undefined```
* Method:  GET
* Response : 200 

### LoadMarketDetails API
* Url :   ```https://host:port/ws/v2/marketDetails/compare```
* Method:  POST
* Sample payload :
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
* Url :   ```https://host:port/ws/v2/mktOverview/spot/Huobi/BTC```
* Method:  GET
* Response : 200  
### loadMarketOverviewFuture API
* Url :   ```https://host:port/ws/v2/mktOverview/future/Huobi/USDT```
* Method:  GET
* Response : 200 
### LoadSymbolOverview API
* Url :   ```https://host:port/ws/v2/mktOverview/overview/future/FIL_CW-undefined```
* Method:  GET
* Response : 200 
### FetchGateioMarketCandlesticks API
* Url :   ```https://host:port/ws/v2/mktOverview/candlesticks/gateio/FNT_STAKE```
* Method:  GET
* Response : 200 

## Order
## SendOrder API 
* Url :   ```https://host:port/ws/v2/order/gateio```
* Method:  POST
* Sample payload :
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
* Url :   ```https://host:port/ws/v2/order/cancel/:walletId/:exchangeName/:orderId/:symbol```
* Method:  POST
* Sample payload :
```     //data
```      
* Response : 200 

## Order Book
### LoadUserOrders API
* Url :   ```https://host:port/ws/v2/ordersBook/0x4a5142af545693dc7ab66bcdc07c8e02cd58841f/future/FIL_CW-undefined```
* Method:  GET
* Response : 200 

## Pool
* Url :   ```https://host:port/ws/v2/pool/1/uniswap-v2```
* Method:  GET 
* Response : 200 

## SymbolPrice
### GetSymbolUsdtPrice
* Url :   ```https://host:port/ws/v2/pool/1/uniswap-v2```
* Method:  GET 
* Response : 200 
### GetSymbolUsdtPrice
* Url :   ```https://host:port/ws/v2/symbolPrice/```
* Method:  POST
* Sample payload :
```    {
        quotes: ["FTX","Binance"],
    }
```   
* Response : 200

## TokenPrice
### GetTokenUsdtPrice API  [GET]
* Url :   ```https://host:port/ws/v2/tokenPrice/USDT/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F```
* Method:  GET 
* Response : 200 
### GetTokenUsdtPrice API  [GET]
* Url :   ```https://host:port/ws/v2/tokenPrice/ETH```
* Method:  GET 
* Response : 200 
### GetTokenUsdtPrice API test [POST]
* Url :   ```https://host:port/ws/v2/tokenPrice/```
* Method:  POST
* Sample payload :
```     {
            quotes: ["USDT"],
            addresses: ["0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F"],
        }
```   
* Response : 200

## User
### GetUserCexBalance API
* Url :   ```https://host:port/ws/v2/user/cexBalance/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/binance```
* Method:  GET 
* Response : 200 
### GetUserCexBalance API
* Url :   ```https://host:port/ws/v2/user/cexOpenOrders/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F```
* Method:  GET 
* Response : 200 
### GetSigning API
* Url :   ```https://host:port/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/auth-message```
* Method:  GET 
* Response : 200 
### FindOrCreateUser API
* Url :   ```https://host:port/ws/v2/user/auth```
* Method:  POST
* Sample payload :
```  {
      walletId: testConfig.walletIdTest,
      signature : testConfig.signatureTest ,
    }
```    
* Response : 200 
 
### GetAll API
* Url :   ```https://host:port/ws/v2/user/```
* Method:  GET 
* Response : 200 
### GetOne API
* Url :   ```https://host:port/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F```
* Method:  GET 
* Response : 200 
 ### Auth API
* Url :   ```https://host:port/ws/v2/user/auth```
* Method:  GET 
* Response : 204
### Create API 
* Url :   ```https://host:port/ws/v2/user/```
* Method:  POST 
* Response : 200
### Update API 
* Url :   ```https://host:port/ws/v2/user/```
* Method:  PUT 
* Sample payload :
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
* Url :   ```https://host:port/ws/v2/user/0x4A5142af545693dc7ab66bcdC07c8E02Cd58841F/????/????```
* Method:  DELETE 
* Response : 200