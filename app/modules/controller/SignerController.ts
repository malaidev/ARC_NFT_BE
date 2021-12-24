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

  message = "Please, sign this message to proceed: ";

  constructor(walletId: string) {
    super();
    if (Web3Utils.isAddress(walletId)) {
      this.walletId = walletId;
    } else {
      throw new Error(`${walletId} is not a valid Ethereum address.`);
    }
  }

  async updateSignatureStatus(instance: IAuthSignerProps) {
    try {
      const updateDoc = {
        $set: {
          verified: true,
        },
      };

      const collection = this.mongodb.collection(this.table);
      await collection.updateOne(instance, updateDoc);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifies web3 signed message with the generated checksum
   *
   * @param signature
   * @returns
   */
  async verifySignature(signature: string) {
    try {
      const hasSignature = await this.findOne(
        {
          walletId: this.walletId,
          verified: false,
        },
        {
          limit: 1,
          sort: {
            timestamp: -1,
          },
        }
      );
      if (!hasSignature.code) {
        this.message.split(": ")[1] = hasSignature.uuid;
        const recovered = sigUtil.recoverPersonalSignature({
          data: this.message,
          sig: signature,
        });
        if (
          Web3Utils.toChecksumAddress(recovered) ===
          Web3Utils.toChecksumAddress(this.walletId)
        ) {
          await this.updateSignatureStatus(hasSignature);
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
        this.message += uuid;
        return {
          message: Buffer.from(this.message).toString("hex"),
          timestamp: this.data.timestamp,
        };
      }
      return insert;
    } catch (error) {
      return respond("Something bad happened.", true, 500);
    }
  }
}
