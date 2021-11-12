import { v4 } from "uuid";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { IAuthSigner, IAuthSignerProps } from "../interfaces/IAuthSigner";
import { respond } from "../util/respond";
import * as Web3Utils from "web3-utils";
import * as sigUtil from "eth-sig-util";

export class SignerController extends AbstractEntity {
  private walletId: string;
  protected table = "Authlog";
  protected data: IAuthSignerProps;

  message = [
    {
      type: "string",
      name: "Message",
      value: "Please, sign this message to proceed.",
    },
    {
      type: "string",
      name: "One time nonce",
      value: "",
    },
  ];

  constructor(walletId: string) {
    super();
    if (Web3Utils.isAddress(walletId)) {
      this.walletId = walletId;
    } else {
      throw new Error(`${walletId} is not a valid Ethereum address.`);
    }
  }

  async updateSignatureStatus(verified: boolean) {
    try {
      const result = ';';
    } catch (error) {
      return null;
    }
  }

  async verifySignature(signature: string) {
    try {
      const hasSignature = await this.findOne(
        {
          walletId: this.walletId,
        },
        {
          limit: 1,
          sort: {
            timestamp: -1,
          },
        }
      );
      if (!hasSignature.code) {
        this.message[1].value = hasSignature.uuid;
        const recovered = sigUtil.recoverTypedSignatureLegacy({
          data: this.message,
          sig: signature,
        });
        if (
          Web3Utils.toChecksumAddress(recovered) ===
          Web3Utils.toChecksumAddress(this.walletId)
        ) {
          await this.updateSignatureStatus(true);
          return true;
        }
      }
      return respond("Invalid signature.", true, 400);
    } catch (error) {
      return respond("Something bad happened.", true, 500);
    }
  }

  /**
   * Creates a signature hash message and saves it to the database log
   * in order to match incoming signature from the client.
   *
   * @returns
   */
  async createSingingHash() {
    try {
      const uuid = v4();
      this.data = {
        uuid,
        walletId: this.walletId,
        verified: false,
        timestamp: new Date().getTime(),
      };
      const insert = await this.create();
      if (!insert.code) {
        this.message[1].value = uuid;
        return {
          message: this.message,
          timestamp: this.data.timestamp,
        };
      }
      return insert;
    } catch (error) {
      return respond("Something bad happened.", true, 500);
    }
  }
}
