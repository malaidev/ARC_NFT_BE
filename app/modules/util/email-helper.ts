import { ObjectID } from "mongodb";
import { config } from "../../config/config";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { IActivity } from "../interfaces/IActivity";
import { INFT } from "../interfaces/INFT";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { respond } from "./respond";

const nodemailer = require("nodemailer");

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

export class mailHelper extends AbstractEntity {
  protected collectiontable: string = "NFTCollection";
  protected nftTable: string = "NFT";
  protected ownerTable: string = "Person";
  protected activityTable: string = "Activity";
  protected emailConfig: any = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "mujoko@arc.market",
      pass: "pkfzhizgfthvkayy",
    },
  };
  protected senderEmail: string = "noreply@arc.market";


  async MakeOfferEmail(data:IActivity): Promise<void | IResponse> {
    try {
        if (this.mongodb) {
          const activityTable = this.mongodb.collection(this.table);
          const nftTable = this.mongodb.collection(this.nftTable);
          const person = this.mongodb.collection(this.ownerTable);
  
          const nft = (await nftTable.findOne({ index: data.nftId })) as INFT;
          const buyerEmail = (await person.findOne({ wallet: data.from })) as IPerson;
          const sellerEmail = (await person.findOne({ wallet: data.to })) as IPerson;
            
          /** send  */
  
          const trf = nodemailer.createTransport(this.emailConfig);
          if (buyerEmail && buyerEmail.email) {
            let mailOptions = {
              from: this.senderEmail,
              to: buyerEmail.email,
              subject: "Make Offer  ",
              html: `<p><h1>NFT  Name : ${nft.name} </h1></p>
                          <p> Price : ${data.price}</p>
                          `,
            };
            trf.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log("Message sent: %s", info.messageId);
            });
          }
  
          if (sellerEmail && sellerEmail.email) {
            let mailOptions = {
              from: this.senderEmail,
              to: sellerEmail.email,
              subject: "Make Offer ",
              html: `<p><h1>NFT  Name : ${nft.name} </h1></p>
                          
                          <p> Buyer : ${data.from}</p>
                          <p> Price : ${data.price}</p>
                          <p> expired : ${data.endDate}</p>
                          `,
            };
            trf.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log("Message sent: %s", info.messageId);
            });
          }
        } else {
          throw new Error("Could not connect to the database.");
        }
      } catch (error) {
        console.log(error);
        return respond(error.message, true, 403);
      }
    

  }
  async AcceptOfferEmail(data:IActivity): Promise<void | IResponse> {
    try {
        if (this.mongodb) {
          const activityTable = this.mongodb.collection(this.table);
          const nftTable = this.mongodb.collection(this.nftTable);
          const person = this.mongodb.collection(this.ownerTable);
  
          const nft = (await nftTable.findOne({ index: data.nftId })) as INFT;
          const buyerEmail = (await person.findOne({ wallet: data.to })) as IPerson;
          const sellerEmail = (await person.findOne({ wallet: data.from })) as IPerson;
            
          /** send  */
  
          const trf = nodemailer.createTransport(this.emailConfig);
          if (buyerEmail && buyerEmail.email) {
            let mailOptions = {
              from: this.senderEmail,
              to: buyerEmail.email,
              subject: "Accept Offer  ",
              html: `<p><h1>NFT  Name : ${nft.name} </h1></p>
              <p> Seller : ${data.from}</p>
                          <p> Price : ${data.price}</p>
                          `,
            };
            trf.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log("Message sent: %s", info.messageId);
            });
          }
  
          if (sellerEmail && sellerEmail.email) {
            let mailOptions = {
              from: this.senderEmail,
              to: sellerEmail.email,
              subject: "Accept Offer ",
              html: `<p><h1>NFT  Name : ${nft.name} </h1></p>
                          
                          <p> Buyer : ${data.to}</p>
                          <p> Price : ${data.price}</p>
                          
                          `,
            };
            trf.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log("Message sent: %s", info.messageId);
            });
          }
        } 
        return
      } catch (error) {
        
        return;
      }

   
  }


  async BuyNow(data: any, person: IPerson): Promise<void | IResponse> {
    try {
      /** send  */
      const trf = nodemailer.createTransport(this.emailConfig);
      let mailOptions = {
        from: this.senderEmail,
        to: person.email,
        subject: "Buy Now ",
        html: `<p><h1>Token ID : ${data.nftId} </h1></p>
                    <p> Seller : ${data.from}</p>
                    <p> Buyer : ${data.to}</p>
                    <p> Price : ${data.price}</p>
                    `,
      };
      trf.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
      });
    } catch (error) {
      console.log(error);
      return respond(error.message, true, 403);
    }
  }

  async CollectionOffer(data: any, person: IPerson): Promise<void | IResponse> {
    try {
      /** send  */
      const trf = nodemailer.createTransport(this.emailConfig);
      let mailOptions = {
        from: this.senderEmail,
        to: person.email,
        subject: "Collection Offer ",
        html: `<p><h1>Colelction ID : ${data.collection} </h1></p>
                    <p> Seller : ${data.to}</p>
                    <p> Buyer : ${data.buyer}</p>
                    <p> Price : ${data.price}</p>
                    `,
      };
      trf.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
      });
    } catch (error) {
      console.log(error);
      return respond(error.message, true, 403);
    }
  };

  async CancelOfferEmail(data: IActivity): Promise<void | IResponse> {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.table);
        const nftTable = this.mongodb.collection(this.nftTable);
        const person = this.mongodb.collection(this.ownerTable);

        const nft = (await nftTable.findOne({ index: data.nftId })) as INFT;
        const buyerEmail = (await person.findOne({ wallet: data.to })) as IPerson;
        const sellerEmail = (await person.findOne({ wallet: data.from })) as IPerson;

        /** send  */

        const trf = nodemailer.createTransport(this.emailConfig);
        if (buyerEmail && buyerEmail.email) {
          let mailOptions = {
            from: this.senderEmail,
            to: buyerEmail.email,
            subject: "Offer decline ",
            html: `<p><h1>NFT  Name : ${nft.name} </h1></p>
                        <p> Seller : ${data.from}</p>
                        <p> Buyer : ${data.to}</p>
                        <p> Price : ${data.price}</p>
                        `,
          };
          trf.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log("Message sent: %s", info.messageId);
          });
        }

        if (sellerEmail && sellerEmail.email) {
          let mailOptions = {
            from: this.senderEmail,
            to: sellerEmail.email,
            subject: "Offer decline ",
            html: `<p><h1>NFT  Name : ${nft.name} </h1></p>
                        <p> Seller : ${data.from}</p>
                        <p> Buyer : ${data.to}</p>
                        <p> Price : ${data.price}</p>
                        `,
          };
          trf.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log("Message sent: %s", info.messageId);
          });
        }
      } else {
        throw new Error("Could not connect to the database.");
      }
    } catch (error) {
      console.log(error);
      return respond(error.message, true, 403);
    }
  };
}
