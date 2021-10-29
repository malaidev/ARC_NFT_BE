import * as fs from "fs";
import { createHash, createDecipheriv, createCipheriv } from "crypto";
import { config } from "../../config/config";

/**
 * This is the CryptoJS default handler.
 *
 * This class serves data encryption and decryption methods.
 * Before using, setup a password file inside `app/.ssh/` or any desired folder, then name it as `crypto-js`.
 * _If you choose to setup the file in another folder or name, be sure to set `passwordFilPath` during the instantiation._
 *
 * @param {string} passwordFilePath (optional) the path to the password file. If not set will get the default `app/.ssh/crypto-js`
 *
 * @method encrypt
 * @method decrypt
 *
 * ```ts
 * import {CryptoJSHandler} from '@/util/CryptoJSHandler';
 *
 * const handler = new CryproJSHandler();
 *
 * const encrypted = handler.encrypt('MySensitiveData123');
 * // e69b2774de366007b336f5cb0ea8ecb4336cbd69a4a5e6d4c7068fd59866a384
 *
 * const decrypted = handler.decrypt(encrypted);
 * // MySensitiveData123
 *
 * ```
 */
export class CryptoJsHandler {
  private secret: string;
  private passwordFilePath: string;
  private resizedIV: Buffer;

  constructor(passwordFilePath = "app/.ssh/crypto-js") {
    this.passwordFilePath = passwordFilePath;
    this.setup();
  }
  /**
   * Setup instance
   */
  private setup() {
    this.readPasswordFile();
    this.createIV();
  }

  /**
   * Allocates IV instance
   */
  private createIV() {
    this.resizedIV = Buffer.allocUnsafe(16);
    const iv = createHash("sha256").update("hashediv").digest();
    iv.copy(this.resizedIV);
  }

  /**
   * Encrypt or decrypt data depending on the `fn` parameter.
   *
   * @param str the encrypted data
   * @param fn `createCipheriv`, `createDecipheriv`
   * @returns the decrypted data
   */
  private _(str: string, fn: Function, secret?: string): string {
    if (["createCipheriv", "createDecipheriv"].includes(fn.name)) {
      // To encoding
      const _a = fn.name === "createCipheriv" ? "hex" : "binary";
      // From encoding
      const _c = _a === "hex" ? "binary" : "hex";

      const _k = createHash("sha256")
        .update(secret ?? this.secret)
        .digest();

      const _$e = fn("aes256", _k, this.resizedIV);
      const _r = [_$e.update(str, _c, _a)];

      _r.push(_$e.final(_a));
      return _r.join("");
    }
    throw new TypeError("Crypher IV function doens't match the action.");
  }

  /**
   * Reads the password file and set `CryptoJSHandler::secret`
   */
  private readPasswordFile() {
    try {
      this.secret = config.jwt.secret;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Encrypt a string
   * @param str the raw data
   * @returns the encrypted data
   */
  encrypt(str: string, secret?: string) {
    return this._(str, createCipheriv, secret);
  }

  /**
   * Decrypt a previously encrypted string
   * @param str the encrypted data
   * @returns the decrypted data
   */
  decrypt(str: string, secret?: string) {
    return this._(str, createDecipheriv, secret);
  }
}
