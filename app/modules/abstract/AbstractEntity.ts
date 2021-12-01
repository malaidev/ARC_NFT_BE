import {
    AggregationCursor,
    Collection,
    CollectionAggregationOptions,
    Db,
    FilterQuery,
    FindOneOptions,
    MongoCallback,
  } from "mongodb";
  import { respond } from "../util/respond";
  import { IResponse } from "../interfaces/IResponse";
  import { IQueryFilters } from "../interfaces/Query";
  import { config } from "../../config/config";
  
  /**
   * This is the AbstractEntity class.
   *
   * This abstract class is the base extension for classes
   * that implements a MongoDB connection and should only be extended.
   *
   * @method create
   * @method findAll
   * @method findOne
   * @method parseFilters
   * @method convertDate
   * @method disconnect
   * @method getData
   *
   * ---
   * ### Usage
   * ```ts
   * import { AbstractEntity } from '@/abstract/AbstractEntity';
   * import { MyDataModel } from '@/interfaces/MyDataModel';
   *
   * class MyController extends AbstractEntity {
   *  protected table = "MyTable";
   *  protected data: MyDataModel;
   *
   *  constructor(data?: MyDataModel) {
   *      super();
   *      this.data = data;
   *  }
   *
   *  async getCertainDocument(){
   *      const this.mongodb = this.mongodb.connect();
   *      const collection = this.mongodb.collection(this.table);
   *      const result = await collection.findAll();
   *      return result;
   *  }
   *  // ... other methods
   * }
   *
   * ```
   *
   * @author Pollum <pollum.io>
   * @since v0.1.0
   */
  export abstract class AbstractEntity {
    protected data: any;
    protected table: string;
    protected mongodb = null as Db;
  
    constructor() {
      if (config.mongodb.instance) this.mongodb = config.mongodb.instance;
      else throw "Unable to connect to the database.";
    }
  
    /**
     * Saves the item or array of items into de database
     * using MongoDB drivers
     * @returns
     */
    async create(): Promise<any | IResponse> {
      console.log(
        `AbstractEntity::create::${this.table}::Trying to create an instance of ${this.table}`
      );
      if (this.data) {
        try {
          if (this.mongodb) {
            /**
             * @var {Collection<any>} collection MongoDB collection instance
             */
            const collection = this.mongodb.collection(this.table);
  
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
          console.log(
            `Couldn't create instance of ${this.table}. Reason: `,
            error
          );
          return respond(error.message, true, 500);
        }
      } else {
        console.log("Can't create an instance of item without item data.");
        return respond(
          "Can't create an instance of item without item data.",
          true,
          400
        );
      }
    }
  
    /**
     * Find an object in the database based on the query
     * @param query
     * @returns
     */
    async findOne(
      query: FilterQuery<any>,
      opts?: FindOneOptions<any>
    ): Promise<any> {
      console.log(`findOne::Trying to find an instance of ${this.table}`);
      try {
        if (this.mongodb) {
          const collection = this.mongodb.collection(this.table);
  
          let projection = { _id: 0 };
  
          if (opts?.projection) {
            projection = {
              ...projection,
              ...opts.projection,
            };
            delete opts.projection;
          }
  
          const options = {
            projection,
            ...opts,
          };
  
          const hasUser = await collection.findOne(query, options);
          if (hasUser) {
            return hasUser;
          } else {
            return null;
          }
        } else {
          throw Error("Could not connect to the database.");
        }
      } catch (error) {
        console.log(`AbstractEntity::findOne::${this.table}`, error);
        return respond(error.message, true, 500);
      }
    }
  
    /**
     * Get all documents in the database
     * @param {IQueryFilters} filters query filters
     * @param options
     * @param callback
     * @return
     */
    async findAll(
      filters?: IQueryFilters,
      options?: CollectionAggregationOptions,
      callback?: MongoCallback<AggregationCursor<any>>
    ) {
      try {
        console.log(`findAll::Trying to find instances of ${this.table}`);
        if (this.mongodb) {
          const collection = this.mongodb.collection(this.table);
          let aggregation = {} as any;
  
          if (filters) {
            aggregation = this.parseFilters(filters);
          }
  
          const items = await collection
            .aggregate(aggregation, options, callback)
            .toArray();
          return items as Array<any>;
        } else {
          throw new Error("Could not connect to the database.");
        }
      } catch (error) {
        console.log(`AbstractEntity::findAll::${this.table}`, error);
        return respond(error.message, true, 500);
      }
    }
  
    /**
     * Inserts an array of items into the database
     * @param collection MongoDB Collection instance
     * @param data array of items
     * @returns
     */
    protected createMany(
      collection: Collection<any>,
      data: Array<any>
    ): Promise<any> {
      const items = this.convertDate(data);
      return new Promise((resolve, reject) => {
        try {
          collection.insertMany(items, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
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
     * Parses the filters attribute in order to obtain a valid MongoDB query object
     * @param filters
     * @returns
     */
    protected parseFilters(filters: IQueryFilters): Array<any> {
      const aggregation = [] as any;
  
      if (filters.orderBy.length)
        aggregation.push({
          $sort: {
            [filters.orderBy]: filters.direction === "DESC" ? -1 : 1,
          },
        });
  
      if (filters.filters.length) {
        const matches = [];
        filters.filters.forEach((item) => {
          matches.push({
            [item.fieldName]: new RegExp(item.query, "igm"),
          });
        });
  
        aggregation.push({
          $match: {
            $or: matches,
          },
        });
      }
  
      if (filters.startAt) {
        aggregation.push({
          $match: {
            date: {
              $gte: filters.startAt,
            },
          },
        });
      }
  
      aggregation.push({
        $limit: filters.amount || 20,
      });
  
      return aggregation;
    }
  
    /**
     * Returns the contents of `{CurrentController}::data`
     * @returns 
     */
    getData(): Array<any> | any {
      return this.data;
    }
}
