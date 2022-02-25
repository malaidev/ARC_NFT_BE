import { MongoDBService } from '../modules/services/MongoDB';

const fastify = require("fastify");
const cookie = require("fastify-cookie");
const cors = require("fastify-cors");
// const { jwt } = require("../../app/config/jwtconfig");
const { jwt } = require("../../app/config/jwtTest");

// Middlewares
import { ActionLogger } from "../modules/middleware/ActionLogger";
import { ErrorLogger } from "../modules/middleware/ErrorLogger";
import { SessionChecker } from "../modules/middleware/SessionChecker";
import { config } from "../config/config";
import { router } from "../modules/routes";
import { LogController } from "../modules/controller/LogController";
import { FastifyReply } from "fastify";

function build() {
  let mongoInstance = new MongoDBService();

  const app = fastify({
    logger: config.env.match(/dev/) && {
      prettyPrint: {
        colorize: true,
      },
    },
  });

   beforeAll(async () => {
    await app.register(cors, {
      methods: "HEAD, OPTIONS, PUT, POST, PATCH, GET, DELETE",
      allowedHeaders: "content-type, authorization, x-usr-addr",
      credentials: true,
      maxAge: 1000 * 60 * 24,
      origin: "*",
    });
  
    await jwt(app);
  
    await app.register(cookie, {
      secret: config.jwt,
    });
    try {
      const instance = new MongoDBService();
      mongoInstance = instance;
      config.mongodb.instance = await instance.connect();
    } catch (error) {
      console.log(error);
      throw new Error(
        `Couldn't connect to the database and gave up after ${config.mongodb.maxTries} tries.`
      );
    }

    await router(app);
  });

  afterAll(() => {
    mongoInstance.disconnect();
    app.close();
  })

  return app
}

export {
  config,
  build
}