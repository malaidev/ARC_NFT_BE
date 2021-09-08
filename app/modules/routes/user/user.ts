import { FastifyReply, FastifyRequest } from "fastify";
import { v4 } from "uuid";
import { DepoUserController } from "../../controller/DepoUserController";
import { IAPIKey } from "../../interfaces/IAPIKey";
import { IAuthorizedBrowser } from "../../interfaces/IAuthorizedBrowser";
import { IResponse } from "../../interfaces/IResponse";
import { IUser } from "../../interfaces/IUser";
import { BrowserIdentityHandler } from "../../util/BrowserIdendityHandler";
import { CryptoJsHandler } from "../../util/CryptoJsHandler";
import { parseQueryUrl } from "../../util/parse-query-url";
import { respond } from "../../util/respond";
/**
 * GET one row from DB
 * @param {*} req 
 * @param {*} res 
 */
export const getOne = async (req: FastifyRequest, res: FastifyReply) => {
  const { walletId } = req.params as any;
  const ctl = new DepoUserController();
  const result = await ctl.findUser(walletId);
  ctl.disconnect();
  if (!result.code) {
    res.send(result);
  } else {
    res.code(result.code).send(result);
  }
}

/**
 * Find or create a user.
 * 
 * If the given wallet id does not exist, then creates a new user using the provided wallet id.
 * 
 * @param req 
 * @param res 
 */
export const findOrCreateUser = async (req: FastifyRequest | any, res: FastifyReply | any) => {
  const { walletId, browserId } = req.body as any;
  const _browserId = browserId ?? req.cookies.__depo_browserid;
  if (walletId) {
    // Pre-creates a browser identifier to set the controller
    const browser = new BrowserIdentityHandler(req.headers, walletId);
    browser.createIdentifier();
    const encryptedId = browser.getBrowserId();
    const user: IUser = {
      settings: {
        defaultWallet: walletId,
      },
      wallets: [{ address: walletId }],
      authorizedBrowsers: [browser.getIdentifier()]
    }

    const ctl = new DepoUserController(user);
    // Tries to find an user which has the given wallet
    const hasUser = await ctl.findUser(walletId) as IUser;
    // Verify if has no "code" in hasUser, indicating an error
    if (!hasUser.code) {
      // If it doesn't it means that we're dealing with an existing user
      // So, we need to verify if his browser is allowed to access the account.
      const verified = await ctl.isBrowserAllowed(hasUser, _browserId, browser);
      if (verified.success) {
        // And if it does, just sent back user's info
        res.send(verified.data);
      } else {
        // If not, sent back a 403 with a warning message
        res.code(verified.code).send(verified);
      }
    } else {
      // And if it didn't find, then create a new user
      // and assign the first browser as authorized.
      const result = await ctl.create();
      if (!result.code) {
        delete result.authorizedBrowsers;
        res.setCookie('__depo_browserid', encryptedId);
        res.send({ user, browserId: encryptedId });
      } else {
        res.code(result.code).send(result);
      }
    }
    ctl.disconnect();
  } else {
    res.code(400).send(respond("Wallet address cannot be null.", true, 400));
  }
}

/**
 * Updates an user
 * @param req 
 * @param res 
 */
export const update = async (req: FastifyRequest, res: FastifyReply) => {
  const user: IUser = req.body;
  const { walletId } = req.params as any;
  const ctl = new DepoUserController(user);
  const result = await ctl.update(walletId);
  ctl.disconnect();
  if (!result) {
    res.code(204).send();
  } else {
    res.code(result.code).send(result);
  }
}

/**
 * GET all rows from DB
 * @param {*} req 
 * @param {*} res 
 */
export const getAll = async (req: FastifyRequest, res: FastifyReply) => {
  const query = req.url.split('?')[1];

  const filters = parseQueryUrl(query);
  const ctl = new DepoUserController();
  const result = await ctl.findAllUsers(filters);
  ctl.disconnect();
  res.send(result);
}

/**
 * Inserts a new row into DB
 * @param {*} req 
 * @param {*} res 
 */
export const create = async (req: FastifyRequest, res: FastifyReply) => {
  const body = req.body as IUser;
  const ctl = new DepoUserController(body);

  const result = await ctl.create();
  ctl.disconnect();
  res.send(result);
}

/**
 * Removes an api key from the database
 * @param {*} req 
 * @param {*} res 
 */
export const removeApiKey = async (req: FastifyRequest, res: FastifyReply) => {
  const { walletId, exchangeId, apiKey } = req.params as any;

  const exchange: IAPIKey = {
    id: exchangeId,
    apiKey,
  };

  const ctl = new DepoUserController();
  const result = await ctl.removeExchange(walletId, exchange);

  if (!result?.code) {
    res.code(204).send();
  } else {
    res.code(result.code).send(result);
  }
}
