import { IQueryFilters } from "../interfaces/Query";
import { IUser } from "../interfaces/IUser";
import { respond } from "../util/respond";
import { IResponse } from "../interfaces/IResponse";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { IPerson } from "../interfaces/IPerson";

export class NFTOwnerController extends AbstractEntity {
  protected data: IPerson;
  protected table = "Owners" as string;
  constructor(user?: IPerson) {
    super();
    this.data = user;
  }
  /**
   * Gets a set of rows from the database
   * @param {IQueryFilters} filters
   */
  async findAllOwners(
    filters?: IQueryFilters
  ): Promise<Array<IPerson> | IResponse> {
    try {
      if (this.mongodb) {
        const collection = this.mongodb.collection(this.table);
        let aggregation = {} as any;
        if (filters) {
          aggregation = this.parseFilters(filters);
        }
        const items = await collection.aggregate(aggregation).toArray();
        return items as Array<IPerson>;
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(`NFTOwnerController::findAllOwners::${this.table}`, error);
      return respond(error.message, true, 500);
    }
  }
  /**
   * Finds the user which has the given wallet id.
   *
   * @param walletId eth user's main wallet id
   * @returns `IUser` if found and `null` otherwise
   */
  async findPerson(personId: string): Promise<IUser | IResponse> {
    const query = this.findUserQuery(personId);
    const result = await this.findOne(query);
    if (result) {
      return result;
    }
    return respond("Person not found.", true, 422);
  }
  // async updateOwner
  /**
   * 
   * @param personId @param 
   * @param bodyData 
   * @returns 
   */
  async updateOwner(wallet:string,bodyData:any): Promise<IPerson | IResponse>{
      try{
          const collection=this.mongodb.collection(this.table);
          const result =  await collection.updateOne({wallet},{$set:{...bodyData}})
          return respond(result)
      }
      catch (error) {
        console.log(`NFTOwnerController::updateOwner::${this.table}`, error);
        return respond(error.message, true, 500);
  }
}
/**
 * 
 * @param ownerId 
 * @returns 
 */
async findOwner(ownerId:string) : Promise<IPerson|IResponse>{
  try{  
    if (this.mongodb){
      const query = this.findPerson(ownerId);
      const result = await this.findOne(query) as IPerson
      if (result){
        return respond(result)
      }
    }
  }catch(error){
    console.log(`NFTOwnerController::findOwner::${this.table}`, error);
        return respond(error.message, true, 500);
  }
}
  /**
   * Mounts a generic query to find an user by its ownerId.
   * @param ownerId
   * @returns 
   */
  private findUserQuery(ownerId: string): Object {
    return {
      // wallets: {
        // $elemMatch: {
          wallet: ownerId,
        // },
      // },
    };
  }
}
