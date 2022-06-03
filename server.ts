// Dependencies
const fastify = require("fastify");
const cookie = require("fastify-cookie");
const cors = require("fastify-cors");
const { jwt } = require("./app/config/jwtconfig");
const multiPart = require("fastify-multipart");
const Moralis = require("moralis/node");
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
import { ActivityController } from "./app/modules/controller/ActivityController";
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
const serverUrl = config.moralis.server_url||"https://yh7xu2rbxbme.usemoralis.com:2053/server";
const appId = config.moralis.appId|| "IQowlTjBIIemiVctRbqdSPfoc2HnpxabUmbLmTSS";
const masterKey = config.moralis.masterKey||"oXPCZ0lXxsUbVBt2PcneIbUoCUC0vuyTFiFIvsrI";
const initMoralis= async () =>{
  await Moralis.start({ serverUrl, appId, masterKey });
  let qryBuyNow=new Moralis.Query('buyNow');
  let subBuyNow = await qryBuyNow.subscribe();
  let qryAcceptOffer=new Moralis.Query('approveOffer');
  let subApproveOver = await qryAcceptOffer.subscribe();
  subApproveOver.on('create', (object) => {
    console.log('object created', object);
  });
  subApproveOver.on('update', (object) => {
    console.log('object Approve ', object);
    console.log(object.get("price_decimal").value['$numberDecimal'])
      const actCtl = new ActivityController();
      if (object.get("confirmed") || object.get("confirmed")=="True"){
           actCtl.listenActivity("APPROVE_OFFER",object.get("maker"),object.get("taker"),object.get("tokenId"),object.get("price_decimal").value['$numberDecimal']);
      }
  });
  subBuyNow.on('create', (object) => {
    // console.log('object created', object);
  });
  subBuyNow.on('update', (object) => {
      console.log('object BuyNow', object);
      console.log(object.get("price_decimal").value['$numberDecimal'])
      const actCtl = new ActivityController();
      if (object.get("confirmed") || object.get("confirmed")=="True"){
          //  console.log('-->>>>>>> Buy')
           actCtl.listenActivity("BUY_NOW",object.get("maker"),object.get("taker"),object.get("tokenId"),object.get("price_decimal").value['$numberDecimal']);
      }
  });
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
        initMoralis()
      });
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
