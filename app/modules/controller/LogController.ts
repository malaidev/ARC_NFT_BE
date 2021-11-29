import { config } from "../../config/config";
import { AbstractEntity } from "../abstract/AbstractEntity";

/**
 * Log Controller
 *
 * This class represents the Log entity and extends the AbstractEntity.
 *
 * @extends AbstractEntity
 * @method — create
 * @method — findAll
 * @method — findOne
 * @method — parseFilters
 * @method — disconnect
 */
export class LogController extends AbstractEntity {
  protected table = "ErrorLogger";
  protected data: any;

  constructor(data: any) {
    super();
    this.data = data;
  }

  /**
   * Dispatch log data to the database
   */
  static async dispatch() {
    console.log(`LogController::dispatch::ErrorLogger`);
    const logPool = config.__logPool;
    if (logPool.length) {
      const ctl = new LogController(logPool);
      try {
        await ctl.create();
        config.__logPool.splice(0);
      } catch (error) {
        console.log(`LogController::dispatch::ErrorLogger`, error);
      }
    }
    return;
  }
}
