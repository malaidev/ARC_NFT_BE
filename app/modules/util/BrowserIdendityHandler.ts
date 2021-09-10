import { v4 } from "uuid";
import { IAuthorizedBrowser } from "../interfaces/IAuthorizedBrowser";
import { CryptoJsHandler } from "./CryptoJsHandler";

/**
 * This class handles browser uniqueness attribution.
 * 
 * @param {any} headers
 * @param {string} walletId
 * 
 * @method createIdentifier
 * @method getBrowserId
 * @method setIdentifier
 * @method getIdentifier
 * 
 * @author [Pollum](pollum.io)
 * @since v0.1.0
 * 
 * ---
 * ## Usage
 * ```ts
 * import { BrowserIdentityHandler } from '@/util/BrowserIdentityHandler';
 * 
 * function get (req: FastifyRequest, res: FastifyReply) {
 *      const { walletId } = req.body;
 *      const browser = new BrowserIdentityHandler(req.headers, walletId);
 *      browser.createIdentity();
 *      const identifier = browser.getIdentifier() // IAuthorizedBrowser
 *      res.send(identifier);
 * }
 * 
 * ```
 */
export class BrowserIdentityHandler {
    private headers: string;
    private walletId: string;
    private identifier: IAuthorizedBrowser;
    private browserId: string;

    constructor(headers?: any, walletId?: string) {
        this.headers = JSON.stringify(headers);
        this.walletId = walletId;
    }

    /**
     * Creates a identifier to the browser.
     * 
     * The identifier is created based on the UUID toke v4 and the browser ID is
     * the encrypted union of the browser ID and the wallet ID. 
     * 
     * According to [AmIUnique](amiunique.org), it's possible to use the browser headers to create some uniqueness to the
     * current browser using its default configurations as `locale`, `language`, `OS`, `version`, etc, so trying to achieve this
     * goal, the identifier uses a combination between `UUID`, `BrowserHeaders`, the user's `walletId`, and a random
     * alias (not unique) to identify the browser in user's account.
     * 
     * _Note that this MAY create some issues when dealing with multiple wallets in the same browser._
     * 
     * @returns the identifier
     */
    createIdentifier(): IAuthorizedBrowser {
        return this.wrap(() => {
            this.identifier = {
                id: v4(),
                name: `App ID ${Math.ceil(Math.random() * 256)}`,
                strIdentifier: Buffer.from(this.headers).toString('base64'),
                authorized: true
            };
            this.createId();
            return this.identifier;
        });
    }

    /**
     * Creates an encrypted id to the instance.
     */
    private createId(): void {
        this.wrap(() => {
            const handle = new CryptoJsHandler();
            // Encrypts ID before verification
            this.browserId = handle.encrypt(`${this.walletId};${this.identifier.id}`);
        });
    }

    /**
     * Update the browser id and browser identification hash
     * @param id an ID. Usually a UUID v4() string
     */
    setBrowserId(id: string) {
        this.identifier.id = id;
        this.createId();
    }

    /**
     * Returns the browser id
     * @returns the generated browser id
     */
    getBrowserId(): string {
        return this.browserId;
    }

    /**
     * Sets the current identifier
     * @param identifier 
     */
    setIdentifier(identifier: IAuthorizedBrowser): void {
        this.identifier = identifier;
    }

    /**
     * Returns the current browser identifier
     * @returns the identifier
     */
    getIdentifier(): IAuthorizedBrowser {
        return this.identifier;
    }

    /**
     * Wraps a function to check for required parameters
     * @param fn 
     * @returns 
     */
    private wrap(fn: Function): any {
        if (this.headers && this.walletId) {
            return fn();
        }
        throw new Error("Can't create identifier without wallet id and request headers.");
    }

}
