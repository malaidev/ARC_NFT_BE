import { FastifyReply, FastifyRequest } from "fastify";
import { v4 } from "uuid";
import { DepoUserController } from "../../controller/DepoUserController";
import { IAPIKey } from "../../interfaces/IAPIKey";
import { IAuthorizedBrowser } from "../../interfaces/IAuthorizedBrowser";
import { IUser } from "../../interfaces/IUser";
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
export const findOrCreateUser = async (req: FastifyRequest, res: FastifyReply) => {
  const { walletId, browserId } = req.body as any;
  if (walletId) {
    const browserIdentifier: IAuthorizedBrowser = {
      id: v4(),
      name: `App ID ${Math.ceil(Math.random() * 256)}`,
      strIdentifier: JSON.stringify(req.headers),
      authorized: true
    }
    /**
     * @var user instance of IUser
     */
    const user: IUser = {
      settings: {
        defaultWallet: walletId,
      },
      wallets: [{ address: walletId }],
      authorizedBrowsers: [browserIdentifier]

    }
    const handle = new CryptoJsHandler();
    const encryptedId = handle.encrypt(`${walletId};${browserIdentifier.id}`);
    const ctl = new DepoUserController(user)
    // Tries to find an user which has the given wallet
    const hasUser = await ctl.findUser(walletId);

    if (!hasUser.code) {
      const isAuthorizedBrowser = ctl.compareHash(hasUser, browserId);

      if (isAuthorizedBrowser !== false) {
        if (isAuthorizedBrowser.authorized) {
          res.send(hasUser);
        } else {
          res.code(403).send(
            respond({
              message: `Browser identified but not yet authorized. Please use an already registered device to allow. Reference: ${isAuthorizedBrowser.name}`,
            },
              true, 403
            )
          )
        }
      } else {
        await ctl.addBrowserIdentifier(browserIdentifier);
        res.code(403).send(
          respond({
            message: `Browser not identified. Please, allow this browser using an already registered device. Reference: ${browserIdentifier.name}`,
            browserId: encryptedId
          },
            true, 403
          )
        );
      }
    } else {
      // And if it didn't find, then create a new user
      const result = await ctl.create();
      if (!result.code) {
        delete result.authorizedBrowsers;

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
