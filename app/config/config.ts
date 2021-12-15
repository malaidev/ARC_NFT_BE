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
  logging: process.env.LOGGING && process.env.LOGGING === "true" ? true : false,
  logLevel:
    process.env.LOG_LEVEL ||
    ("error-only" as "error-only" | "action-only" | "any"),
  mongodb: {
    host: process.env["MONGODB_HOST"],
    database: "DepoMetamaskUsers",
    username: process.env["MONGODB_USER"],
    password: process.env["MONGODB_PASSWORD"],
    port: process.env["MONGODB_PORT"],
    instance: null as Db,
    createInstance: async () => {
      const instance = new MongoDBService();
      config.mongodb.instance = await instance.connect();
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
  route: (method: "jwt" | "token", permission?: string | number) => {
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

config.mongodb.createInstance();

export { config };
