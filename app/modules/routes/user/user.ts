import { FastifyReply, FastifyRequest } from "fastify";
import { DepoUserController } from "../../controller/DepoUserController";
import { IUser } from "../../interfaces/IUser";
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
  if (result) {
    res.send(result);
  } else {
    res.code(422).send(respond("User not found.", true, 422));
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
  const { walletId } = req.body as any;
  if (walletId) {
    /**
     * @var user instance of IUser
     */
    const user: IUser = {
      settings: {
        defaultWallet: walletId,
      },
      wallets: [{ address: walletId }]
    }
    const ctl = new DepoUserController(user)
    // Tries to find an user which has the given wallet
    const hasUser = await ctl.findUser(walletId);
    if (hasUser) {
      res.send(hasUser);
    } else {
      // And if it didn't find, then create a new user
      const result = await ctl.create();
      if (!result.code) {
        res.send(user);
      } else {
        res.code(result.code).send(result);
      }
    }
  } else {
    res.code(400).send(respond("`Wallet address cannot be null.`", true, 400));
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

  const result = ctl.create();
  res.send(result);
}