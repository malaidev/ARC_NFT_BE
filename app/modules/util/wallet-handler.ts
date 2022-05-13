import { AbstractEntity } from "../abstract/AbstractEntity";
import { IResponse } from "../interfaces/IResponse";
import * as Web3Utils from "web3-utils";
import * as sigUtil from "eth-sig-util";
export class walletHandler extends AbstractEntity {
  protected ownerTable: string = "Person";

  constructor() {
    super();

  }

  async verifyOwnership():Promise<void>{

      try {
        if (this.mongodb) {
          const person= this.mongodb.collection(this.ownerTable);
          const result = await person.find({}).toArray();
          let bulkUpdate =[];
          await Promise.all(
            result.map(async(p)=>{
                let upd={
                  "updateOne":{
                    "filter":{wallet:p.wallet},
                    "update":{$set:{verifyOwnerShip:Web3Utils.isAddress(p.wallet)?true:false}}
                  }
                };
                bulkUpdate.push(upd);
            })
        );

        const update=await person.bulkWrite(bulkUpdate);

        }else{
          throw new Error("Could not connect to the database.");
        }


      } catch (error) {

        // throw new Error(error.message);

      }



  }


  private async verifyWallet (walletId:string): Promise<void | IResponse> {
    try {
      if (this.mongodb) {
        let arc;
        let decimals = 18;

        // const _div = ethers.BigNumber.from(10).pow(decimals);
        //     const toData=(bn)=>bn.div(_div).toNumber().toFixed(0);

        //     arc = this.load(walletId);
        //     console.log(arc);
        //     return respond(`${walletId} is validated`)

      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      // return respond(error.message, true, 403);
    }
  }


}
