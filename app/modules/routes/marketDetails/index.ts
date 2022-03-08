import { loadMarketDetails, loadAllExchangesOrderBook } from './get';
import { compareExchangesOperation } from './compareExchanges';



const opts = {
  schema: {
    tags: ['MarketDetails']
    // response: {
    //   200: {
    //     type: 'object',
    //     properties: {
    //       hello: { type: 'string' }
    //     }
    //   }
    // }
  }
}

const opts2 = {      
    schema: {
      tags: ['MarketDetails'],
      params: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'user id'
          },
          marketType: {
            type: 'string',
            description: 'marketType id'
          }
        }
      }
    // response: {
    //   200: {
    //     type: 'object',
    //     properties: {
    //       hello: { type: 'string' }
    //     }
    //   }
    // }
  }
}
// const headerSchema = {
//   schema: {
//     headers: {
//       type: 'object',
//       properties: {
//         authorization: {
//           type: 'string',
//           description: 'api token'
//         }
//       },
//       required: ['authorization']
//     }
//   }
// }
// const headerSchema = {
//   type: 'object',
//   required: ['token'],
//   properties: {
//     authorization: { 
//       type: 'string'
//       // description: 'bearer token'
//     }
//   },
// };

const schemaBody = {
  schema: {
    security: [{ ApiToken: [] }],
    // headers: headerSchema,
    tags: ['MarketDetails'],
    body: {
      type: 'object',
      properties: {
        hello: { type: 'string' },
        obj: {
          type: 'object',
          properties: {
            some: { type: 'string' },
            constantProp: { const: 'my-const' }
          }
        }
      },
      required: ['hello']
    }
  }
}

 
export const marketDetails = async (router: any, options: any) => {
  router.get('/:exchangeName/:symbol',opts, loadMarketDetails);
  router.get('/orderBook/:marketType/:symbol', opts,loadAllExchangesOrderBook);  
  router.post('/compare',opts, compareExchangesOperation);
}
