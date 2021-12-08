import { Db, MongoClient } from "mongodb";
import { config } from "../../config/config";

export class MongoDBService {
  private client = null as MongoClient;
  private dbname = "" as string;
  private db = null;
  private password = "" as string;
  private username = "" as string;
  private host = "" as string;
  private port = "" as string;

  constructor(dbName?: string) {
    console.log("Creating MongoDB Instance", config.mongodb);
    this.dbname = dbName ?? config.mongodb.database;
    this.password = encodeURIComponent(config.mongodb.password);
    this.username = encodeURIComponent(config.mongodb.username);
    this.host = config.mongodb.host;
    this.port = config.mongodb.port;

    let connectionStr = `mongodb+srv://${this.username}:${this.password}@${this.host}/defaultDb?retryWrites=true&w=majority`;
    if (config.env === "development") {
      connectionStr = `mongodb://${this.username}:${this.password}@${this.host}?authMecanism=DEFAULT`;
    }
    
    this.client = new MongoClient(connectionStr, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectWithNoPrimary: true,
    });
  }

  /**
   * Connect to the mongodb instance for the given
   * db name and returns its connection.
   * @returns {Promise<Db>} the mongodb connection
   */
  connect(): Promise<Db> {
    console.log("Connection requested.");
    return new Promise((resolve, reject): Promise<Db> => {
      try {
        this.client.connect((err) => {
          console.log("Trying to connect to mongodb");
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log("Connection Succeed");
            this.db = this.client.db(this.dbname);
            resolve(this.db);
          }
        });
      } catch (error) {
        console.log(error);
        reject(error);
        return;
      }
    });
  }

  /**
   * Closes the connection with the server
   */
  disconnect() {
    console.log("Disconnecting from database..");
    this.client.close();
  }
}
