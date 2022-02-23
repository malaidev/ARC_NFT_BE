import Fastify from 'fastify'
import fp from 'fastify-plugin'
import {router} from '../../app/modules/routes'


// Fill in this config with all the configurations
// needed for testing the application
async function config () {
  return {}
}
    
// Automatically build and tear down our instance
function build () {
  const app = Fastify();

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  

  beforeAll(async () => {
    void app.register(fp(router), await config());
    await app.ready();
  });

  afterAll(() => app.close())

  return app
}

export {
  config,
  build
}