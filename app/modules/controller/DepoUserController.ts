import { IQueryFilters } from "../interfaces/Query";
import { IUser } from "../interfaces/IUser";
import { respond } from "../util/respond";
import { IResponse } from "../interfaces/IResponse";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { IAPIKey } from "../interfaces/IAPIKey";
import { CryptoJsHandler } from "../util/CryptoJsHandler";
import { IAuthorizedBrowser } from "../interfaces/IAuthorizedBrowser";
import { BrowserIdentityHandler } from "../util/BrowserIdendityHandler";

/**
 * This is the model controller class.
 * Do all the model's functions such as
 * authenticate, logout, CRUD functions
 * or processing.
 *
 * @param {IUser} data model data
 *
 * @method create
 * @method findAllUsers
 * @method findUser
 * @method update
 * @method create
 *
 * @author Pollum <pollum.io>
 * @version 0.0.1
 *
 * ----
 * Example Usage
 *
 * const uc = new DepoAuthController();
 *
 * if(await uc.login().success) {...}
 *
 */
export class DepoUserController extends AbstractEntity {
  protected data: IUser;
  protected table = "Users" as string;

  constructor(user?: IUser) {
    super();
    this.data = user;
  }

  /**
   * Gets a set of rows from the database
   * @param {IQueryFilters} filters
   */
  async findAllUsers(
    filters?: IQueryFilters
  ): Promise<Array<IUser> | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.table);
        let aggregation = {} as any;

        if (filters) {
          aggregation = this.parseFilters(filters);
        }

        const items = await collection.aggregate(aggregation).toArray();
        return items as Array<IUser>;
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`DepoUserController::findAllUsers::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Finds the user which has the given wallet id.
   *
   * @param walletId eth user's main wallet id
   * @returns `IUser` if found and `null` otherwise
   */
  async findUser(walletId: string): Promise<IUser | IResponse> {
    const query = this.findUserQuery(walletId);
    const result = await this.findOne(query, {
      projection: { "exchanges.apiSecret": 0, _id: 0 },
    });
    if (result) {
      return result;
    }
    return respond("User not found.", true, 422);
  }

  /**
   * Updates a user.
   *
   * _Note that this will only add objects to the array, not delete. To delete, use `removeWallet` or `removeExchange` methods._
   *
   * @param walletId main user's wallet id
   */
  async update(walletId: string): Promise<void | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.table);
        const query = this.findUserQuery(walletId);
        const hasUser = await this.findOne(query);
        // Verify if has any error while finding user
        console.log("has user : ", hasUser);
        if (!hasUser.code) {
          // if not mount the query to update an user
          const filter = this.findUserQuery(walletId);
          // mount the $set query
          const updateDoc = this.moundUpdateUserDocument(hasUser);
          await collection.updateOne(filter, updateDoc.document);
          // verify if any data was missing during the update
          if (updateDoc.errors.length) {
            // If so, return the warning
            return respond(updateDoc.errors);
          }
          // void otherwise (204)
          return;
        } else {
          // If hasUser has errors, return the errors to the client.
          return hasUser as IResponse;
        }
      } else {
        throw Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`DepoUserController::findAllUsers::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Get the api keys from a user.
   *
   * _Note that this function will decrypt the api secrets and it should never be used
   * along the client side._
   *
   * @param walletId user's wallet address
   * @returns
   */
  async getUserApiKeys(walletId: string): Promise<Array<IAPIKey>> {
    const query = this.findUserQuery(walletId.toLowerCase());
    const result = (await this.findOne(query, {
      projection: { exchanges: 1 },
    })) as IUser;
    if (result && result.exchanges) {
      return this.decryptApiKey(result.exchanges) as Array<IAPIKey>;
    }
  }

  /**
   * Removes an API KEY from the database.
   * @param walletId user's wallet address
   * @param exchange exchangeID and apiKey
   */
  async removeExchange(walletId: string, exchange: IAPIKey) {
    // Get the user
    const query = this.findUserQuery(walletId);
    const hasUser = (await this.findOne(query)) as IUser;
    // Checks if the user exists
    if (!hasUser.code) {
      // And if it does, check if the user has saved exchanges
      if (hasUser.exchanges) {
        // Copies the result instance
        const user: IUser = hasUser;
        // Checks if the desired api key exists
        const hasExchange = user.exchanges.findIndex(
          (item) => exchange.id === item.id && exchange.apiKey === item.apiKey
        );
        if (hasExchange !== -1) {
          // and if it does, deletes it from the array to perform an update
          user.exchanges.splice(hasExchange, 1);
          // then creates an update document
          const updateDoc = {
            $set: {
              exchanges: user.exchanges,
            },
          };
          // Try to save
          try {
            if (this.mongodb) {
              const collection = this.mongodb.collection(this.table);
              const filter = this.findUserQuery(walletId);
              await collection.updateOne(filter, updateDoc);
              return;
            } else {
              throw Error("Could not connect to the database.");
            }
          } catch (error) {
            console.log(
              `DepoUserController::findAllUsers::${this.table}`,
              error
            );
            return respond(error.message, true, 500);
          }
        }
      }
      return respond("Api Key not found", true, 422);
    }
    return hasUser;
  }

  /**
   * Creates a browser instance with the current browser
   * parameters and saves it into the User object.
   *
   * The browser will be saved as an `unauthorized` browser so
   * the user will have to allow the connection for this specific
   * browser, from another device.
   *
   * @param browser browser identifier object
   * @returns void if success, otherwise the error message.
   */
  async addBrowserIdentifier(
    browser: IAuthorizedBrowser
  ): Promise<IResponse | void> {
    try {
      browser.authorized = false;
      const query = this.findUserQuery(this.data.settings.defaultWallet);
      const hasUser = (await this.findOne(query)) as IUser;
      if (!hasUser.code) {
        if (
          !hasUser.authorizedBrowsers.find((item) => item.id === browser.id)
        ) {
          const authorizedBrowsers = hasUser.authorizedBrowsers;
          authorizedBrowsers.push(browser);

          const updateDoc = {
            $set: {
              authorizedBrowsers,
            },
          };

          const collection = this.mongodb.collection(this.table);
          await collection.updateOne(query, updateDoc);
          return;
        }
      } else {
        return hasUser as IResponse;
      }
    } catch (error) {
      console.log(`DepoUserController::findAllUsers::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }

  /**
   * Mounts a generic query to find an user by its walletId.
   * @param walletId
   * @returns
   */
  private findUserQuery(walletId: string): Object {
    return {
      wallets: {
        $elemMatch: {
          address: walletId,
        },
      },
    };
  }

  /**
   * Mount a mongodb compatible update document
   * @returns
   */
  private moundUpdateUserDocument(user: IUser): {
    document: Object;
    errors: any[];
  } {
    const document = { $set: {} };
    delete user._id;
    const errors = this.mountUpdateExchanges(user);
    this.mountUpdateWallets(user);

    // Write the update query
    for (let item in this.data) {
      document.$set[item] = this.data[item];
    }

    return { document, errors };
  }

  /**
   * Compares the current instance of `user.wallets` with the new one and
   * parses fields to be updates.
   *
   * _Note that this will only add objects to the array, not delete. To delete, use the `removeWallet` method._
   *
   * @param user
   */
  private mountUpdateWallets(user: IUser): void {
    // Check if wallet[] is present in the update
    if (this.data.wallets) {
      // if so, filter new wallets to create and update the existing wallets.
      this.data.wallets.forEach((wallet) => {
        if (user.wallets) {
          // Find the index of the current wallet
          const hasWallet = user.wallets.findIndex(
            (item) => item.address === wallet.address
          );
          // If it doesn't exist, create
          if (hasWallet === -1) {
            user.wallets.push(wallet);
          } else {
            // Otherwise, overwrite
            user.wallets[hasWallet] = wallet;
          }
        } else {
          // If the user has no wallet, create the object and insert the new one
          user.wallets = [];
          user.wallets.push(wallet);
        }
      });
      // set the wallets to be updated.
      this.data.wallets = user.wallets;
    }
  }

  /**
   * Compares the current instance of `user.exchanges` with the new one and
   * parses fields to be updates.
   *
   * _Note that this will only add objects to the array, not delete. To delete, use the `removeExchange` method._
   *
   * @param user
   * @return {Array<any>} an array of errors if something is missing from apikeys.
   */
  private mountUpdateExchanges(user: IUser): Array<any> {
    const errors = [];
    // Verify if the exchanges object is present
    if (this.data.exchanges) {
      this.data.exchanges.forEach((exchange) => {
        // Verify if the update object has exchanges to update
        if (user.exchanges) {
          // Verify if the current object already exists
          const hasExchange = user.exchanges.findIndex(
            (item) => item.id === exchange.id
          );
          // verify if there's no data missing from the current apikey data
          if (hasExchange === -1) {
            if (this.verifyApiKey(exchange)) {
              // if so, create
              user.exchanges.push(this.encryptApiKey(exchange));
            } else {
              // And if there's errors, save it to return to the client.
              errors.push({
                error: "Missing data from api key",
                reference: exchange.id,
              });
            }
          }
        } else if (this.verifyApiKey(exchange)) {
          // If the object "exchange" does not exist, then create one
          user.exchanges = [];
          user.exchanges.push(this.encryptApiKey(exchange));
        }
      });
    }
    this.data.exchanges = user.exchanges;
    return errors;
  }

  /**
   * Encryipt the api key secret
   * @param apiKey
   * @returns
   */
  private encryptApiKey(apiKey: IAPIKey) {
    const handler = new CryptoJsHandler();

    const _apiKey: IAPIKey = {
      ...apiKey,
      apiSecret: handler.encrypt(apiKey.apiSecret),
    };
    // Also encrypts extrafields.password if exists.
    if (apiKey.extraFields) {
      _apiKey.extraFields = apiKey.extraFields.map((extraField) => {
        if (extraField.fieldName?.match(/password/i)) {
          return {
            fieldName: extraField.fieldName,
            value: handler.encrypt(extraField.value),
          };
        } else return extraField;
      });
    }
    return _apiKey;
  }

  /**
   * Decrypts an api key or an array of keys.
   *
   * If `apiKey` is an array, it will result in an array and if not,
   * it will result in a single object.
   *
   * @param apiKey
   * @returns
   */
  public decryptApiKey(
    apiKey: IAPIKey | Array<IAPIKey>
  ): IAPIKey | Array<IAPIKey> {
    const handler = new CryptoJsHandler();
    if (Array.isArray(apiKey)) {
      return apiKey.map((key: IAPIKey) =>
        this.decryptApiKey(key)
      ) as Array<IAPIKey>;
    } else {
      const _apiKey: IAPIKey = {
        ...apiKey,
        apiSecret: handler.decrypt(apiKey.apiSecret),
      };
      // Decrypts also extrafields.password if exists
      if (apiKey.extraFields) {
        _apiKey.extraFields = apiKey.extraFields.map((extraField) => {
          if (extraField.fieldName?.match(/password/i)) {
            return {
              fieldName: extraField.fieldName,
              value: handler.decrypt(extraField.value),
            };
          } else return extraField;
        });
      }

      return _apiKey;
    }
  }

  /**
   * Verify if any data is missing from the apikey object before inserting.
   * @param apiKey
   * @returns
   */
  private verifyApiKey(apiKey: IAPIKey): boolean {
    return !!(apiKey.apiKey && apiKey.apiSecret && apiKey.id);
  }

  /**
   * Compares the browser id hash with the saved authorized browsers
   * found in a user instance.
   *
   * @param user an user instance
   * @param browserId the browser id
   * @returns if it is trustable or not
   */
  compareHash(
    user: IUser,
    browserId: string,
    browser: BrowserIdentityHandler
  ): IAuthorizedBrowser | false {
    let decryptedId = null;
    let actualBrowserId = null;
    try {
      const handle = new CryptoJsHandler();
      decryptedId = handle.decrypt(browserId);
      actualBrowserId = decryptedId.split(";")[1];
    } catch (error) {
      console.log(`DepoUserController::findAllUsers::${this.table}`, error);
      // We don't care, just keep decryptedId and actualBrowserId as null.
    }

    // Then search the authorized browser
    if (user.authorizedBrowsers) {
      const strIdentifier = browser.getIdentifier().strIdentifier;
      // To get a browser, we check for both the given browser id and the strIdentifier
      // The identifier is composed by the browser headers data. Usually it is different for each browser/PC/person
      // So it is fair to combine with the wallet ID to create some uniqueness
      const hasBrowserId = user.authorizedBrowsers.find(
        (item) =>
          item.id === actualBrowserId || item.strIdentifier === strIdentifier
      );

      // If the browser exists in a way or another, return the authorized browser data.
      if (hasBrowserId) {
        browser.setBrowserId(hasBrowserId.id);
        delete hasBrowserId.strIdentifier;
        delete hasBrowserId.id;
        hasBrowserId.browserId = browser.getBrowserId();
        return hasBrowserId;
      }
    }
    return false;
  }

  /**
   * Verifies if the current browser is allowed to access the current user's account
   * based on its browser id.
   *
   * @param user an user
   * @param browserId the current browser id
   * @param browserIdentifier the pre-created browser identifier
   * @param encryptedId the encrypted browser id
   * @returns a standarized response allowed or not allowed
   */
  async isBrowserAllowed(
    user: IUser,
    browserId: string,
    browser: BrowserIdentityHandler
  ): Promise<IResponse> {
    // First, compares the user's authorized browser with the current browser id
    const isAuthorizedBrowser = this.compareHash(user, browserId, browser);
    const identifier = browser.getIdentifier();
    // if the browser exist, check if it is authorized
    if (isAuthorizedBrowser !== false) {
      if (isAuthorizedBrowser.authorized) {
        // and if it is, just send back the user
        delete user.authorizedBrowsers;
        return respond({ user, browserId: isAuthorizedBrowser.browserId });
      }
      // Else, send a warning about the fact that this is a new browser
      return respond(
        {
          message: `Browser identified but not yet authorized. Please use an already registered device to allow. Browser reference: ${isAuthorizedBrowser.name}`,
        },
        true,
        403
      );
    }
    // If the browser doesn't exist, add to the list of authorization request and send back a message
    // about it.
    await this.addBrowserIdentifier(identifier);
    return respond(
      {
        message: `Browser not identified. Please, allow this browser using an already registered device. Browser reference: ${identifier.name}`,
        browserId: browser.getBrowserId(),
      },
      true,
      403
    );
  }
}
