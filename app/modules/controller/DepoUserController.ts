import { MongoDBService } from "../services/MongoDB";
import { IQueryFilters } from "../interfaces/Query";
import { IUser } from "../interfaces/IUser";
import { respond } from "../util/respond";
import { IResponse } from "../interfaces/IResponse";
import { AbstractEntity } from "../abstract/AbstractEntity";

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
  async findAllUsers(filters?: IQueryFilters): Promise<Array<IUser> | IResponse> {
    try {
      const dbm = await this.mongodb.connect();
      if (dbm) {
        const collection = dbm.collection(this.table);
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
    const result = await this.findOne(query);
    if (result) {
      return result;
    }
    return respond("User not found.", true, 422);
  }

  /**
   * Updates a user
   * @param walletId main user's wallet id
   */
  async update(walletId: string): Promise<void | IResponse> {
    try {
      const dbm = await this.mongodb.connect();
      if (dbm) {
        const collection = dbm.collection(this.table);
        const hasUser = await this.findUser(walletId);
        if (!hasUser.code) {
          const filter = this.findUserQuery(walletId);
          const updateDoc = this.moundUpdateUserDocument(hasUser);
          await collection.updateOne(filter, updateDoc);
          return;
        } else {
          return hasUser as IResponse;
        }
      } else {
        throw Error("Could not connect to the database.");
      }
    } catch (error) {
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
      "wallets": {
        "$elemMatch": {
          address: walletId
        }
      }
    };
  }

  /**
   * Mount a mongodb compatible update document
   * @returns 
   */
  private moundUpdateUserDocument(user: IUser): Object {
    const updateDoc = { $set: {} };

    if (this.data.wallets) {
      this.data.wallets.forEach((wallet) => {
        if (user.wallets) {
          const hasWallet = user.wallets.findIndex((item) => item.address === wallet.address)
          if (hasWallet !== -1) {
            user.wallets.push(wallet);
          } else {
            user.wallets[hasWallet] = wallet;
          }
        } else {
          user.wallets = [];
          user.wallets.push(wallet);
        }
      });
      this.data.wallets = user.wallets;
    }

    for (let item in this.data) {
      updateDoc.$set[item] = this.data[item];
    }

    return updateDoc;
  }
}