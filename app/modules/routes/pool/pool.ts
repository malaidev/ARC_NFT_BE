import { FastifyReply, FastifyRequest } from "fastify";
import { PoolController } from "../../controller/PoolController";
import { SupportedPools } from "../../interfaces/Networks";
import { respond } from "../../util/respond";
/**
 * GET one row from DB
 * @param {*} req
 * @param {*} res
 */
export const get = async (req: FastifyRequest, res: FastifyReply) => {
  const { chainId, protocol } = req.params as {
    chainId: 1 | 56 | 137;
    protocol: keyof SupportedPools;
  };
  if (protocol.match(/^sushiswap$|^uniswap-v2$/gim)) {
    if ([1, 56, 137].includes(+chainId)) {
      const ctl = new PoolController(chainId, protocol);
      try {
        const pools = await ctl.findLast();
        res.send(pools);
      } catch (error) {
        res.code(500).send(respond("Something bad happened", true, 500));
      }
    } else {
      res
        .code(400)
        .send(
          respond(
            `Protocol ${protocol} not supported for chain ID ${chainId}.`,
            true,
            400
          ),
        );
    }
  } else {
    res
      .code(400)
      .send(respond(`Protocol ${protocol} not supported yet.`, true, 400));
  }
};
