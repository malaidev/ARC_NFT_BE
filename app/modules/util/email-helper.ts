
import { ObjectID } from "mongodb";
import { config } from "../../config/config";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { ActivityType, IActivity } from "../interfaces/IActivity";
import { INFTReward } from "../interfaces/INFTReward";
import { IResponse } from "../interfaces/IResponse";
import { respond } from "./respond";



// let transporter = nodemailer.createTransport({
//     pool: true,
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true, // use TLS
//     auth: {
//         user: 'mujoko@arc.market',
//         pass: 'pkfzhizgfthvkayy'
//     }
//   });
//   let mailOptions = {
//     from: 'mujoko@arc.market',
//     to: 'aris@arc.market',
//     subject: 'subject',
//     html: '<h1>Aris ganteng</h1>',
//   };

export class mailHelper extends AbstractEntity{

    protected collectiontable: string = "NFTCollection";
    protected nftTable: string = "NFT";
    protected ownerTable: string = "Person";
    protected activityTable: string = "Activity";
    protected emailConfig: any={
        host:'smtp.gmail.com',
        port:465,
        secure:true,
        auth:{
            user: 'mujoko@arc.market',
            pass: 'pkfzhizgfthvkayy'
        }
    };

    async offerEmail(activityId:number):Promise<void|IResponse>{
        try {
            


        } catch (error) {
            console.log(error);
            return respond(error.message,true,403)
          }
    }
}