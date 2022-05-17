import { FastifyReply, FastifyRequest } from 'fastify';
import { respond } from '../../util/respond';
import { v4 as uuidv4 } from 'uuid';
import { signSmartContractData } from '@wert-io/widget-sc-signer';
import { Interface } from '@ethersproject/abi';
import nftPurchaseModuleABI from '../../abi/nftPurchaseModuleABI.json';
import { config } from '../../../config/config';

export const sign = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { commodity_amount, takeOrder, makeOrder } = req.body as any;

    const iface = new Interface(nftPurchaseModuleABI);
    const callData = iface.encodeFunctionData('purchaseNFTWithETH', [
      takeOrder,
      makeOrder
    ]);
    const signedData = signSmartContractData(
      {
        address: takeOrder.taker,
        commodity: 'ETH',
        commodity_amount,
        pk_id: config.nft.pkId,
        sc_address: config.nft.nftPurchaseModuleAddress,
        sc_id: uuidv4(),
        sc_input_data: callData,
      },
      config.nft.privateKey
    );

    return res.code(200).send({ signedData });
  } catch (err) {
    return res.status(400).send(respond('Something went wrong.', true, 400));
  }
};
