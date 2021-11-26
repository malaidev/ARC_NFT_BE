import { get } from "./pool";

/**
 * Exports the users actions routes.
 * @param {*} router
 * @param {*} options
 */
export const pool = async (router: any, options: any) => {
  router.get("/:chainId/:protocol", get);
};
