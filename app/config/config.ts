import { Db } from "mongodb";
import { MongoDBService } from "../modules/services/MongoDB";

if (process.env && !process.env.ENV?.match(/prod|stag/gi)) {
  const dotenv = require("dotenv");
  dotenv.config();
}

const config = {
  io: null,
  __logPool: [],

  env: process.env.ENV || "staging",
  env_db: process.env.ENV_DB || "localdb",
  logging: true,
  logLevel: process.env.LOG_LEVEL || ("error-only" as "error-only" | "action-only" | "any"),
  mongodb: {
    host: process.env["MONGODB_HOST"],
    database: process.env["MONGODB_SCHEMA"],
    username: process.env["MONGODB_USER"],
    password: process.env["MONGODB_PASSWORD"],
    port: process.env["MONGODB_PORT"],
    instance: null as Db,
    maxTries: 5,
    createInstance: async (tryCount = 1) => {
      console.log("Trying to connect to the database. Connection counter: ", tryCount);
      try {
        const instance = new MongoDBService();
        config.mongodb.instance = await instance.connect();
      } catch (error) {
        if (tryCount < config.mongodb.maxTries) {
          console.log("Couldn't connect to the datbase, retrying.");
          await config.mongodb.createInstance(++tryCount);
        } else {
          console.log(error);
          throw new Error(`Couldn't connect to the database and gave up after ${config.mongodb.maxTries} tries.`);
        }
        return;
      }
    },
  },
  server: {
    port: process.env["SERVER_PORT"],
  },
  jwt: {
    secret: process.env["JWT_SECRET"],
  },
  mailer: {
    apiKey: process.env["EMAIL_SERVICE_API_KEY"],
    domain: process.env["EMAIL_SERVICE_DOMAIN"],
  },
  contract: {
    privateKey: process.env["CONTRACT_PRIVATE_KEY"],
    depoTokenAddress: process.env["CONTRACT_DEPO_TOKEN_ADDRESS"],
    paymentModuleAddress: process.env["CONTRACT_PAYMENT_MODULE_ADDRESS"],
    pkId: process.env["CONTRACT_PK_ID"],
  },
  nft: {
    privateKey: process.env["NFT_PRIVATE_KEY"],
    nftPurchaseModuleAddress: process.env["NFT_PURCHASE_MODULE_ADDRESS"],
    pkId: process.env["NFT_PK_ID"],
  },
  arcAdress:{
    ARC721:process.env["ARC721"],
    ARC1155:process.env["ARC1155"]
  },
  route: (method: "jwt" | "token", permission?: string | number) => {
    return {
      schema: {
        params: {
          type: "object",
          properties: {
            ownerId: { type: "string", pattern: "^[a-zA-Z0-9-_]+$" },
            contract: { type: "string", pattern: "^[a-zA-Z0-9-_]+$" },
            nftId: { type: "number" },
            creatorEarning:{type:"number"}
          },
        },
        properties: {
          protected: {
            method,
            permission: permission || 1,
          },
        },
      },
    };
  },
  routeParamsValidationJWT: (method: "jwt" | "token") => {
    return {
      schema: {
        params: {
          type: "object",
          properties: {
            ownerId: { type: "string", pattern: "^[a-zA-Z0-9-_]+$" },
            contract: { type: "string", pattern: "^[a-zA-Z0-9-_]+$" },
            nftId: { type: "number" },
            
            
          },
        },
        properties: {
          protected: {
            method,
            permission:2
          },
        },
      },
    };
  },
  routeParamsValidation: () => {
    return {
      schema: {
        params: {
          type: "object",
          properties: {
            ownerId: { type: "string", pattern: "^[a-zA-Z0-9-_]+$" },
            contract: { type: "string", pattern: "^[a-zA-Z0-9-_]+$" },
            nftId: { type: "number" },
            
            tokenId: { type: "number" },
          },
        },
      },
    };
  },

  aws: {
    s3_user_bucket: process.env["AWS_S3_USER_BUCKET"],
    s3_key: process.env["AWS_S3_KEY"],
    s3_secret: process.env["AWS_S3_SECRET"],
  },
  moralis:{
    server_url:process.env["MORALIS_URL"],
    appId:process.env["MORALIS_APPID"],
    masterKey:process.env["MORALIS_MASTER_KEY"]
  },
  opensea:{
    api_key:process.env["OPENSEA_KEY"]||"c9881567f3eb42749934d3743642e5dd",
    api_addr:process.env["OPENSEA_ADDR"]||"https://api.opensea.io/api/v1/"
  },
  google_recaptcha:{
    server:process.env["GOOGLE_RECAPTCHA"],
    urlVerification:process.env["GOOGLE_SITE_VERIFY"]
  },
  mail_auth:{
    user:process.env["MAIL_USER"],
    pass:process.env["MAIL_PASS"]
  }
};

export { config };
