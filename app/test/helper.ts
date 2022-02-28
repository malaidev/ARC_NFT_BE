import Fastify from 'fastify'
import { router } from "../modules/routes";
import { config } from '../config/config';
import { MongoDBService } from '../modules/services/MongoDB';

function build() {
  let mongoInstance = new MongoDBService();
  const app = Fastify();

  beforeAll(async () => {
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