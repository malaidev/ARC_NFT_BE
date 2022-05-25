import { ObjectID } from "mongodb";
import { config } from "../../config/config";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { IActivity } from "../interfaces/IActivity";
import { INFT } from "../interfaces/INFT";
import { IPerson } from "../interfaces/IPerson";
import { IResponse } from "../interfaces/IResponse";
import { respond } from "./respond";

const nodemailer = require("nodemailer");
 
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
      user: config.mail_auth.user,
      pass: config.mail_auth.pass,
    },
  };
  protected senderEmail: string = "noreply@arc.market";
  async MakeOfferEmail(data:IActivity): Promise<void | IResponse> {
    try {
        if (this.mongodb) {
          const activityTable = this.mongodb.collection(this.activityTable);
          const nftTable = this.mongodb.collection(this.nftTable);
          const person = this.mongodb.collection(this.ownerTable);
          const nft = (await nftTable.findOne({ index: data.nftId })) as INFT;
          const buyerEmail = (await person.findOne({ wallet: data.from })) as IPerson;
          const sellerEmail = (await person.findOne({ wallet: data.to })) as IPerson;
          /** send  */
          const trf = nodemailer.createTransport(this.emailConfig);
          if (buyerEmail && buyerEmail.email) {
            const title="Make Offer"
            const content = `You have received an offer for your NFT listed on the ARC NFT Marketplace. Please visit <link> to see more details.`
            let mailOptions = {
              from: this.senderEmail,
              to: buyerEmail.email,
                subject:title,
                html: this.emailContent(title,content),
            };
            trf.sendMail(mailOptions, (error, info) => {});
          }
  
          if (sellerEmail && sellerEmail.email) {

            const title="Make Offer"
            const content = `You have received an offer for your NFT listed on the ARC NFT Marketplace. Please visit <link> to see more details.`
            let mailOptions = {
              from: this.senderEmail,
              to: sellerEmail.email,
              subject:title,
              html:this.emailContent(title,content) ,
            };
            trf.sendMail(mailOptions, (error, info) => {});
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
          const activityTable = this.mongodb.collection(this.activityTable);
          const nftTable = this.mongodb.collection(this.nftTable);
          const person = this.mongodb.collection(this.ownerTable);
  
          const nft = (await nftTable.findOne({ index: data.nftId })) as INFT;
          const buyerEmail = (await person.findOne({ wallet: data.to })) as IPerson;
          const sellerEmail = (await person.findOne({ wallet: data.from })) as IPerson;
            
          /** send  */
          const trf = nodemailer.createTransport(this.emailConfig);
          if (buyerEmail && buyerEmail.email) {
            const title="Collection offer received"
            const content = `Your offer for an NFT on the ARC NFT Marketplace has been accepted! Visit <link> to view your new NFT!`
            let mailOptions = {
              from: this.senderEmail,
              to: buyerEmail.email,
              subject: title,
              html: this.emailContent(title,content),
            };
            trf.sendMail(mailOptions, (error, info) => {});
          }
  
          if (sellerEmail && sellerEmail.email) {
            const title="Collection offer receive"
            const content = `Your offer for an NFT on the ARC NFT Marketplace has been accepted! Visit <link> to view your new NFT!`
            let mailOptions = {
              from: this.senderEmail,
              to: sellerEmail.email,
              subject: title,
              html: this.emailContent(title,content),
            };
            trf.sendMail(mailOptions, (error, info) => {});
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
      const title="Buy Now"
      const content = `Your NFT has been purchased by a user using the ‘Buy Now’ function. Please visit <link> to see more details.`

      const trf = nodemailer.createTransport(this.emailConfig);
      let mailOptions = {
        from: this.senderEmail,
        to: person.email,
        subject:  title,
        html: this.emailContent(title,content)
      };
      trf.sendMail(mailOptions, (error, info) => {});
    } catch (error) {
      console.log(error);
      return respond(error.message, true, 403);
    }
  }

  async CollectionOffer(data: any, person: IPerson): Promise<void | IResponse> {
    try {
      /** send  */
      const title="Collection Offer"
      const content = `You have received an offer for your NFT on the ARC NFT Marketplace! Please visit <link> to view the offer.`
      const trf = nodemailer.createTransport(this.emailConfig);
      let mailOptions = {
        from: this.senderEmail,
        to: person.email,
        subject: title,
        html: this.emailContent(title,content),
      };
      trf.sendMail(mailOptions, (error, info) => {});
    } catch (error) {
      console.log(error);
      return respond(error.message, true, 403);
    }
  };

  async CancelOfferEmail(data: IActivity): Promise<void | IResponse> {
    try {
      if (this.mongodb) {
        const activityTable = this.mongodb.collection(this.activityTable);
        const nftTable = this.mongodb.collection(this.nftTable);
        const person = this.mongodb.collection(this.ownerTable);

        const nft = (await nftTable.findOne({ index: data.nftId })) as INFT;
        const buyerEmail = (await person.findOne({ wallet: data.to })) as IPerson;
        const sellerEmail = (await person.findOne({ wallet: data.from })) as IPerson;

        /** send  */
       
        const trf = nodemailer.createTransport(this.emailConfig);
        if (buyerEmail && buyerEmail.email) {
          const title="Collection Offer Rejected"
          const content = `Your collection offer has been rejected. Go to <link> to place another offer.        `
    
          let mailOptions = {
            from: this.senderEmail,
            to: buyerEmail.email,
            subject:title,
            html: this.emailContent(title,content),
          };
          trf.sendMail(mailOptions, (error, info) => {});
        }

        if (sellerEmail && sellerEmail.email) {
          const title="Collection Offer Rejected"
          const content = `Your collection offer has been rejected. Go to <link> to place another offer.        `
    
          let mailOptions = {
            from: this.senderEmail,
            to: sellerEmail.email,
            subject:title,
            html: this.emailContent(title,content),
          };
          trf.sendMail(mailOptions, (error, info) => {
            
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


private  emailContent(title:string,content:string){
  return `<html>
  <head>
  <title>${title}</title>
  <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
  <style type="text/css" media="screen"> 
      
          body {
              background-color:#00152b;
              text-align:center;
              color: #ffffff;
          }
       
          #layout {
            
              background:#00152b;
              margin: 10px auto;
              text-align:left;
          }
         
          #header {
        background-repeat:no-repeat;
              width: 600px;
        height: 101px;
              /*@editable*/ padding: 0px;
          }
         
          #content {
              /*@editable*/ font-size: 12px;
              /*@editable*/ color: #ffffff;
              /*@editable*/ font-style: normal;
              /*@editable*/ font-weight: normal;
              /*@editable*/ font-family: Helvetica;
              /*@editable*/ line-height: 17px;
              /*@editable*/ padding: 10px 10px 10px 10px;
          vertical-align: top;
          }
      #content p {
        width: 500px;
        font: Helvetica;
        font-size:11px;
      }
          
          .primary-heading {
              /*@editable*/ font-size: 16px;
              /*@editable*/ font-weight: bold;
              /*@editable*/ color: #ffffff;
              /*@editable*/ font-family: Helvetica;
              /*@editable*/ margin: 25px 0 0 0;
          }
          
          .secondary-heading {
              /*@editable*/ font-size: 13px;
              /*@editable font-weight: bold;*/
              /*@editable*/ color: #ffffff;
              /*@editable*/ font-style: normal;
              /*@editable*/ font-family: Helvetica;
              /*@editable*/ margin: 25px 0 5px 0;
          }
      .address {
        color:#ffffff;
        font-family:Helvetica;
        font-size:9px;
        margin-bottom:0;
        margin-left:auto;
        margin-right:auto;
        margin-top:0;
        padding-bottom:0;
        padding-top:0px;
                                  text-align:center;
      }
      .address a {
        color:#8e8c88;
        text-decoration:none;
      }
      .address span {
        color:#FFF;
      }
          
          #footer {
        /*border-right:thin #00467f solid;*/
        
        width: 600px;
        height:70px;
              padding: 20px 20px 0 20px;
              /*@editable*/ font-size: 10px;
              /*@editable*/ color: #ffffff;
              /*@editable*/ line-height: 100%;
              /*@editable*/ font-family: Helvetica;
        text-align:center;
          }
         
          #footer a {
              /*@editable*/ color: #ffffff;
              /*@editable*/ text-decoration: none;
              /*@editable*/ font-weight: normal;
        text-align:center;
          }
          #footer a:hover {
              /*@editable*/ color: #ffffff;
              /*@editable*/ text-decoration: underline;
              /*@editable*/ font-weight: normal;
        text-align:center;
          }
         
  </style>
  </head>
  <body bgcolor="#FFFFFF" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
  <table id="layout" border="0" cellspacing="0" cellpadding="0" width="600">
    <tr>
      <td>
        <img src="https://d396f6yqtfj97a.cloudfront.net/static/arc_word.png"  height="99" alt=""></td>
    </tr>
    <tr>
      <td width="523" style="vertical-align:top;" id="content">
        <h1 mc:edit="heading" class="primary-heading">ARC makes the entire crypto market available from the palm of your hand. We're redefining the status quo by refining all of DeFi. Unplug from institutional finance as we empower users to achieve true financial freedom, returning 50% of revenue to $ARC token holders.</h1>
              <h2 mc:edit="subheading" class="secondary-heading">Dear valued ARC user,</h2>
        <p>
          <div mc:edit="content" style="color:#fff">
                      ${content}
          </div>
        </p>
        </td>
    </tr>
    <tr>
      <td colspan="2" id="footer" mc:edit="footer">
              <p>This message and any attachment is intended for the use of the person to whom it is addressed and contains information that is confidential. If you are not the intended recipient, or the employee or agent responsible for its delivery to the intended recipient, you are hereby notified that any dissemination, distribution or copying of it is strictly prohibited.
              </p>
              <h3 class="address" style="margin-bottom:0px;padding-bottom:0px; vertical-align:bottom;"> <span class="address"> | </span>  <span class="address"> | </span>    <span class="address"> | </span>    <span class="address"> | </span>  <a style="color:#00467f; font-weight:bold;" href="https://arc.market">arc.market</a></h3>
        <!-- <p><a href="*|ARCHIVE|*" class="adminText">view email in browser</a> | <a href="*|UNSUB|*">Unsubscribe</a> | <a href="*|UPDATE_PROFILE|*">Update your profile</a> | <a href="*|FORWARD|*">Forward to a friend</a></p>  -->
              <p>Copyright (C) 2022</p><br />
        </td>
    </tr>
  </table>
  </body>
  </html>`
}
}
