import { FastifyReply, FastifyRequest } from 'fastify';
import { respond } from '../../util/respond';
import { v4 as uuidv4 } from 'uuid';
import { signSmartContractData } from '@wert-io/widget-sc-signer';
import { Interface } from '@ethersproject/abi';
import paymentModuleABI from '../../abi/paymentModuleABI.json';
import { config } from '../../../config/config';

export const sign = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { address, commodity_amount } = req.body as any;

    const iface = new Interface(paymentModuleABI);
    const callData = iface.encodeFunctionData('purchaseTokenFromETH', [
      config.contract.depoTokenAddress,
      address,
    ]);
    const signedData = signSmartContractData(
      {
        address,
        commodity: 'ETH',
        commodity_amount,
        pk_id: config.contract.pkId,
        sc_address: config.contract.paymentModuleAddress,
        sc_id: uuidv4(),
        sc_input_data: callData,
      },
      config.contract.privateKey
    );

    return res.code(200).send({ signedData });
  } catch (err) {
    return res.status(400).send(respond('Something went wrong.', true, 400));
  }
};
