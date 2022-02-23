import {
    getAll,
    getOne,
    findId,
    update,
    deleteTest,
  } from "./getAPI";
  import { config } from "../../../config/config";
  
  /**
   * Exports the users actions routes.
   * @param {*} router
   * @param {*} options
   */

   const opts = {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        }
      }
    }
  }
  export const test = async (router: any, options: any) => {
    // router.get("/", config.route("jwt"), getAll);
    // router.get("/:getId", config.route("jwt"), getOne);
    // router.post("/", findId);
    // router.put("/:getId", config.route("jwt"), update);
    // router.delete( "/:getId/", config.route("jwt"), deleteTest);
    router.get("/", opts, getAll);
    router.get("/:getId", opts, getOne);
    router.post("/", findId);
    router.put("/:getId", opts, update);
    router.delete( "/:getId", opts, deleteTest);
  };
  