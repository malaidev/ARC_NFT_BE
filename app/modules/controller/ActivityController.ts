import { AbstractEntity } from "../abstract/AbstractEntity";
import { IActivity } from "../interfaces/IActivity";
import { IResponse } from "../interfaces/IResponse";
import { IQueryFilters } from "../interfaces/Query";
import { respond } from "../util/respond";
/**
 * This is the NFT controller class.
 * Do all the NFT's functions such as
 * get item detail, history, create and transfer.
 *
 * @param {IActivity} data INFT data
 *
 * @property {data}
 * @property {table}
 * @property {personTable}
 * @property {historyTable}
 * @property {nftCollectionTable}
 * 
 * @method getAllActivites
 *
 * @author Tadashi <tadashi@depo.io>
 * @version 0.0.1
 *
 * ----
 * Example Usage
 *
 * const ctl = new ActivityController();
 *
 * await ctl.getAllActivites()
 *
 */
export class ActivityController extends AbstractEntity {
  protected data: IActivity;
  protected table: string = "Activity";
  /**
   * Constructor of class
   * @param activity IActivity item data
   */
  constructor(activity?: IActivity) {
    super();
    this.data = activity;
  }

  /**
   * Get all NFTs in collection
   * @param contract Collection Contract Address
   * @param filters filter
   * @returns Array<
>
   */
  async getAllActivites(filters?: IQueryFilters): Promise<IResponse> {
    try {
      if (this.mongodb) {
        const table = this.mongodb.collection(this.table);
        const result = await table.find().toArray();
        if (result) {
          return respond(result);
        }
        return respond("activity not found.", true, 422);
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`ActivityController::getAllActivites::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }
}
