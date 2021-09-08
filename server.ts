// Dependencies
const fastify = require('fastify');
const cookie = require('fastify-cookie');
const cors = require('fastify-cors');
const { jwt } = require('./app/config/jwtconfig');


// Services
import { Logger } from './app/modules/services/Logger';

// Middlewares
import { ActionLogger } from './app/modules/middleware/ActionLogger';
import { ErrorLogger } from './app/modules/middleware/ErrorLogger';
import { SessionChecker } from './app/modules/middleware/SessionChecker';
import { config } from './app/config/config';
import { router } from './app/modules/routes';

const logger = new Logger('error', '/');
process.setMaxListeners(15);

/**
 * Mounts the server
 * 
 * @returns {FastifyInstance} app
 */
async function mount() {

  const app = fastify({
    logger: config.env === 'dev' && {
      prettyPrint: {
        colorize: true,
      }
    }
  })

  await app.register(cors, {
    methods: 'HEAD, OPTIONS, PUT, POST, PATCH, GET, DELETE',
    allowedHeaders: 'content-type, authorization, x-usr-addr',
    credentials: true,
    maxAge: 1000 * 60 * 24,
    origin: '*',
  });

  await jwt(app);

  await app.register(cookie, {
    secret: config.jwt
  });

  /**
   * This hooks acts as middlewares performing
   * actions on each one of these calls
   * -----
   * Logs route actions
   */
  if (config.logging)
    app.addHook('onRequest', ActionLogger)

  /** Checks if session is valid */
  app.addHook('onRequest', async (req, res) => {
    await SessionChecker(req, res, app);
  });

  /** Log errors */
  app.addHook('onError', ErrorLogger);

  /** Register routes */
  await router(app);

  return app;
}

/** Server start */
mount().then((app) => {
  app.listen(config.server.port ?? 3001, '0.0.0.0', (error, addr) => {
    if (error) {
      if (config.logging) {
        logger.setData(error.message);
        logger.save();
      }
      process.exit(1);
    }
  })
});
