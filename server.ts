// Dependencies
const fastify = require("fastify");
const cookie = require("fastify-cookie");
const cors = require("fastify-cors");
const { jwt } = require("./app/config/jwtconfig");
const multiPart = require("fastify-multipart");


// Middlewares
import { ActionLogger } from "./app/modules/middleware/ActionLogger";
import { ErrorLogger } from "./app/modules/middleware/ErrorLogger";
import { SessionChecker } from "./app/modules/middleware/SessionChecker";
import { config } from "./app/config/config";
import { router } from "./app/modules/routes";
import { LogController } from "./app/modules/controller/LogController";
import { FastifyReply } from "fastify";
import * as SwaggerPlugin from "fastify-swagger";
import fastifyCron from 'fastify-cron'
import { rewardHelper } from "./app/modules/util/reward-handler";
import * as helmet from '@fastify/helmet'
import { walletHandler } from "./app/modules/util/wallet-handler";

process.setMaxListeners(15);

/**
 * Mounts the server
 *
 * @returns {FastifyInstance} app
 */
async function mount() {
  const app = fastify({
    logger: config.env.match(/dev/) && {
      prettyPrint: {
        colorize: true,
      },
    },
  });

  await app.register(cors, {
    methods: "HEAD, OPTIONS, PUT, POST, PATCH, GET, DELETE",
    allowedHeaders: "content-type, authorization, x-usr-addr",
    credentials: true,
    maxAge: 1000 * 60 * 24,
    origin: "*",
  });


  await app.register(require('@fastify/rate-limit'), {
    max: 200,
    timeWindow: '1 minute'
  })

  await jwt(app);

  await app.register(cookie, {
    secret: config.jwt,
  });
  if (process.env.ENV !== "dev") {
    await app.register(helmet, { global: true, enableCSPNonces: true });
  }
    await app.register(multiPart, { attachFieldsToBody: true, limits: { fileSize: 1024 * 1024 * 1024 } });

  // await app.register(fastifyCron,{
  //   jobs:[
  //     {

  //       cronTime:'0 0 * * *',

  //       onTick: async server => {
  //         console.log('Run -->>> Reward')
  //         const x = new rewardHelper();
  //         const y = await x.calculateReward();
  //         // console.log(y)
  //       },

  //     },
  //     {

  //       cronTime:'0 0 * * *',

  //       onTick: async server => {
  //         console.log('Run -->>> verify ownership')
  //         const x = new walletHandler();
  //         const y = await x.verifyOwnership()
  //         // console.log(y)
  //       },

  //     }
  //   ]
  // })

  if (process.env.ENV === "dev") {
    await app.register(SwaggerPlugin, {
      routePrefix: "/doc",
      mode: "static",
      exposeRoute: true,
      specification: {
        path: "./app/spec/be-spesification.json",
        postProcessor: function (swaggerObject) {
          return swaggerObject;
        },
        baseDir: "/app/spec",
      },
      swagger: {
        info: {
          title: "ARC API",
          description: "REST API ARC documentation",
          version: "1.0.0",
        },
        externalDocs: {
          url: "https://swagger.io",
          description: "Find more info here",
        },
        host: "staging.api.arc.market:443",
        schemes: ["http", "https"],
        consumes: ["application/json"],
        produces: ["application/json"],
        securityDefinitions: {
          ApiToken: {
            description: 'Authorization header token, sample: "Bearer #TOKEN#"',
            type: "apiKey",
            name: "Authorization",
            in: "header",
          },
        },
      },
    });
  }

  /**
   * This hooks acts as middlewares performing
   * actions on each one of these calls
   * Logs route actions
   */

  /** Checks if session is valid */
  app.addHook("onRequest", async (req, res) => {
    await SessionChecker(req, res, app);
  });

  if (config.logging) {
    if (["any", "action-only"].includes(config.logLevel)) app.addHook("onRequest", ActionLogger);

    if (["any", "error-only"].includes(config.logLevel)) app.addHook("onError", ErrorLogger);

    app.addHook("onResponse", async (req, res: FastifyReply) => {
      if (res.statusCode >= 400) {
        config.__logPool.push({
          type: "GLOBAL_CATCHER",
          request: {
            body: req.body,
            params: req.params,
            context: req.context.config,
          },
          statusCode: res.statusCode,
          headers: res.getHeaders(),
        });
      }
      await LogController.dispatch();
    });
  }

  /** Register routes */
  await router(app);

  return app;
}

config.mongodb
  .createInstance()
  .then(() => {
    /** Server start */
    mount().then((app) => {
      app.listen(config.server.port ?? 3001, "0.0.0.0", (error, addr) => {
        if (error) {
          if (config.logging) {
            console.error(error);
          }
          process.exit(1);
        }
        // app.cron.startAllJobs();
      });
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
