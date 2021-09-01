import { MongoDBService } from "../services/MongoDB";
import { Collection } from "mongodb";
import { IQueryFilters } from "../interfaces/Query";
import { IUser } from "../interfaces/IUser";
import { respond } from "../util/respond";
import { IResponse } from "../interfaces/IResponse";

/**
 * This is the model controller class.
 * Do all the model's functions such as
 * authenticate, logout, CRUD functions
 * or processing.
 * 
 * @param {any} data model data 
 * 
 * @author Andre Mury
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
export class DepoUserController {
  private data: IUser;
  private table = "Users" as string;
  private mongodb = null as MongoDBService;

  constructor(user?: IUser) {
    this.mongodb = new MongoDBService();
    this.data = user;
  }

  /**
   * Saves the item or array of items into de database
   * using MongoDB drivers
   * @returns 
   */
  async create(): Promise<any | IResponse> {
    if (this.data) {
      try {
        /**
         * @var dbm Mongo DB connection instance
         */
        const dbm = await this.mongodb.connect();
        if (dbm) {
          /**
           * @var {Collection<any>} collection MongoDB collection instance
           */
          const collection = dbm.collection(this.table);

          /**
           * @var {any} result the MongoDB request results
           */
          let result = null;
          // Checks if data attribute is an array
          if (Array.isArray(this.data)) {
            result = await this.createMany(collection, this.data);
          } else {
            // If it isn't, convert this.data to array
            result = await this.createMany(collection, [this.data]);
          }
          return result;
        } else {
          throw new Error("Could not connect to the database.");
        }
      } catch (error) {
        return respond(error.message, true, 500);
      }
    } else {
      return respond("Can't create an instance of item without item data.", true, 400);
    }
  }

  /**
   * Inserts an array of items into the database
   * @param collection MongoDB Collection instance
   * @param data array of items
   * @returns 
   */
  protected createMany(collection: Collection<any>, data: Array<any>): Promise<any> {
    const items = this.convertDate(data);
    return new Promise((resolve, reject) => {
      try {
        collection.insertMany(items, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
      } catch (error) {
        reject(error);
      }
    })
  }

  /**
   * Converts a date string to JavaScript Date Format.
   * @param data array of items
   * @returns 
   */
  protected convertDate(data: Array<any>): Array<any> {
    data.forEach((item) => {
      item.date = new Date(item.date);
    });
    return data;
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
    try {
      const dbm = await this.mongodb.connect();
      if (dbm) {
        const collection = dbm.collection(this.table);

        const query = this.findUserQuery(walletId);
        const options = {
          projection: { _id: 0 }
        };

        const hasUser = await collection.findOne(query, options);
        if (hasUser) {
          return hasUser as IUser;
        } else {
          return respond("User not found.", true, 422);
        }
      } else {
        throw Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
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
        if (hasUser) {
          const filter = this.findUserQuery(walletId);
          const updateDoc = this.moundUpdateUserDocument(hasUser);
          await collection.updateOne(filter, updateDoc);
          return;
        } else {
          return respond("User not found", true, 422);
        }
      } else {
        throw Error("Could not connect to the database.");
      }
    } catch (error) {
      return respond(error.message, true, 500);
    }
  }

  /**
   * Parses the filters attribute in order to obtain a valid MongoDB query object
   * @param filters 
   * @returns 
   */
  protected parseFilters(filters: IQueryFilters): Array<any> {
    const aggregation = [] as any;

    if (filters.orderBy.length)
      aggregation.push({
        '$sort': {
          [filters.orderBy]: filters.direction === 'DESC' ? -1 : 1,
        }
      });

    if (filters.filters.length) {
      const matches = [];
      filters.filters.forEach((item) => {
        matches.push({
          [item.fieldName]: new RegExp(item.query, 'igm')
        })
      });

      aggregation.push({
        '$match': {
          '$or': matches
        }
      })
    }

    if (filters.startAt) {
      aggregation.push({
        '$match': {
          date: {
            '$gte': filters.startAt
          }
        }
      })
    }

    aggregation.push({
      '$limit': filters.amount || 20
    })

    return aggregation;
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
        if (!user.wallets.find((item) => item.address === wallet.address)) {
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

  disconnect() {
    this.mongodb.disconnect();
  }

  /**
   * Returns the contents of `DepoAuthController::data`
   * @returns 
   */
  getData(): Array<any> | any {
    return this.data;
  }
}