import { Db } from 'mongodb';
import { MongoDBService } from '../modules/services/MongoDB';

if (process.env && !process.env.ENV?.match(/prod|stag/gi)) {
  const dotenv = require('dotenv');
  dotenv.config();
}

const config = {
  io: null,
  __logPool: [],

  env: process.env.ENV || 'staging',
  logging: process.env.LOGGING && process.env.LOGGING === 'true' ? true : false,
  logLevel:
    process.env.LOG_LEVEL ||
    ('error-only' as 'error-only' | 'action-only' | 'any'),
  mongodb: {
    host: process.env['MONGODB_HOST'],
    database: 'DepoMetamaskUsers',
    username: process.env['MONGODB_USER'],
    password: process.env['MONGODB_PASSWORD'],
    port: process.env['MONGODB_PORT'],
    instance: null as Db,
    maxTries: 5,
    createInstance: async (tryCount = 1) => {
      console.log(
        "Trying to connect to the database. Connection counter: ",
        tryCount
      );
      try {
        const instance = new MongoDBService();
        config.mongodb.instance = await instance.connect();
      } catch (error) {
        if (tryCount < config.mongodb.maxTries) {
          console.log("Couldn't connect to the datbase, retrying.");
          await config.mongodb.createInstance(++tryCount);
        } else {
          console.log(error);
          throw new Error(
            `Couldn't connect to the database and gave up after ${config.mongodb.maxTries} tries.`
          );
        }
        return;
      }
    },
  },
  server: {
    port: process.env['SERVER_PORT'],
  },
  jwt: {
    secret: process.env['JWT_SECRET'],
  },
  mailer: {
    apiKey: process.env['EMAIL_SERVICE_API_KEY'],
    domain: process.env['EMAIL_SERVICE_DOMAIN'],
  },
  contract: {
    privateKey: process.env['CONTRACT_PRIVATE_KEY'],
    depoTokenAddress: process.env['CONTRACT_DEPO_TOKEN_ADDRESS'],
    paymentModuleAddress: process.env['CONTRACT_PAYMENT_MODULE_ADDRESS'],
    pkId: process.env['CONTRACT_PK_ID'],
  },
  route: (method: 'jwt' | 'token', permission?: string | number) => {
    return {
      schema: {
        properties: {
          protected: {
            method,
            permission: permission || 1,
          },
        },
      },
    };
  },
};

export { config };
