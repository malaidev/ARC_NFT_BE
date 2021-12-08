// Dependencies
const fastify = require("fastify");
const cookie = require("fastify-cookie");
const cors = require("fastify-cors");
const { jwt } = require("./app/config/jwtconfig");

// Middlewares
import { ActionLogger } from "./app/modules/middleware/ActionLogger";
import { ErrorLogger } from "./app/modules/middleware/ErrorLogger";
import { SessionChecker } from "./app/modules/middleware/SessionChecker";
import { config } from "./app/config/config";
import { router } from "./app/modules/routes";
import { LogController } from "./app/modules/controller/LogController";
import { FastifyReply } from "fastify";

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

  await jwt(app);

  await app.register(cookie, {
    secret: config.jwt,
  });

  /**
   * This hooks acts as middlewares performing
   * actions on each one of these calls
   * -----
   * Logs route actions
   */

  /** Checks if session is valid */
  app.addHook("onRequest", async (req, res) => {
    await SessionChecker(req, res, app);
  });

  if (config.logging) {
    if (["any", "action-only"].includes(config.logLevel))
      app.addHook("onRequest", ActionLogger);

    if (["any", "error-only"].includes(config.logLevel))
      app.addHook("onError", ErrorLogger);

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
      });
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
