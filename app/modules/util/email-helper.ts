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
      background-color: #FFF;
      text-align: center;
      color: #000;
  }

  #layout {

      background: #fff;
      ;
      margin: 10px auto;
      text-align: left;
  }

  #header {
      background-repeat: no-repeat;
      width: 600px;
      height: 101px;
      /*@editable*/
      padding: 0px;
  }

  #content {
      /*@editable*/
      font-size: 12px;
      /*@editable*/
      color: #000;
      /*@editable*/
      font-style: normal;
      /*@editable*/
      font-weight: normal;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      line-height: 17px;
      /*@editable*/
      padding: 10px 10px 10px 10px;
      vertical-align: top;
  }

  #content p {
      width: 500px;
      font: Helvetica;
      font-size: 11px;
  }

  .primary-heading {
      /*@editable*/
      font-size: 14px;
      /*@editable*/
      font-weight: bold;
      /*@editable*/
      color: #000;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      margin: 25px 0 0 0;
  }

  .secondary-heading {
      /*@editable*/
      font-size: 13px;
      /*@editable font-weight: bold;*/
      /*@editable*/
      color: #000;
      /*@editable*/
      font-style: normal;
      /*@editable*/
      font-family: Helvetica;
      /*@editable*/
      margin: 25px 0 5px 0;
  }

  .address {
      color: #000;
      ;
      font-family: Helvetica;
      font-size: 9px;
      margin-bottom: 0;
      margin-left: auto;
      margin-right: auto;
      margin-top: 0;
      padding-bottom: 0;
      padding-top: 0px;
      text-align: center;
  }

  .address a {
      color: #8e8c88;
      text-decoration: none;
  }

  .address span {
      color: #FFF;
  }

  #footer {
      /*border-right:thin #00467f solid;*/

      width: 600px;
      height: 70px;
      padding: 20px 20px 0 20px;
      /*@editable*/
      font-size: 10px;
      /*@editable*/
      color: #000;
      /*@editable*/
      line-height: 100%;
      /*@editable*/
      font-family: Helvetica;
      text-align: center;
  }

  #footer a {
      /*@editable*/
      color: #ffffff;
      /*@editable*/
      text-decoration: none;
      /*@editable*/
      font-weight: normal;
      text-align: center;
  }

  #footer a:hover {
      /*@editable*/
      color: #ffffff;
      /*@editable*/
      text-decoration: underline;
      /*@editable*/
      font-weight: normal;
      text-align: center;
  }
</style>

  </head>
 

  <body bgcolor="#ffffff" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
    <table id="layout" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
            <td>
                <img src="https://d396f6yqtfj97a.cloudfront.net/static/black.png" height="99" alt="">
            </td>
        </tr>
        <tr>
            <td width="523" style="vertical-align:top;" id="content">
                <h1 mc:edit="heading" class="primary-heading">ARC makes the entire crypto market available from the palm
                    of your hand. We're redefining the status quo by refining all of DeFi. Unplug from institutional
                    finance as we empower users to achieve true financial freedom, returning 50% of revenue to $ARC
                    token holders.</h1>
                <h2 mc:edit="subheading" class="secondary-heading">Dear valued ARC user,</h2>
                <p>
                <div mc:edit="content">
                    ${content}
                </div>
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <table cellpadding="0" cellspacing="0"
                    style="color:rgb(0,0,0);font-family:&quot;Times New Roman&quot;;font-size:medium">
                    <tbody style="margin:0px;padding:0px;width:600px">
                        <tr style="margin:0px;padding:0px">
                            <td style="padding:0px 0px 0px 10px;width:45px"><img
                                    src="https://d396f6yqtfj97a.cloudfront.net/static/arc-logo.png" alt="Arc"
                                    style="margin:0px 20px 0px 0px;padding:0px;width:45px" class="CToWUd">
                            </td>
                            <td width="90%" style="padding:0px">
                                <h1
                                    style="margin:0px;padding:0px;font-family:proxima-nova,sans-serif;font-size:20px;line-height:25px;color:rgb(0,0,0)">
                                    ARC Team</h1>
                                <div><span
                                        style="color:rgb(0,0,0);font-family:proxima-nova,sans-serif;font-size:14px;margin-top: 10px;">NFT
                                        Marketplace</span><br></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td colspan="2" id="footer" mc:edit="footer">
                <p>This message and any attachment is intended for the use of the person to whom it is addressed and
                    contains information that is confidential. If you are not the intended recipient, or the employee or
                    agent responsible for its delivery to the intended recipient, you are hereby notified that any
                    dissemination, distribution or copying of it is strictly prohibited.
                </p>
            </td>
        </tr>
        <tr>
            <td>
                <table cellpadding="0" cellspacing="0"
                    style="color:rgb(0,0,0);font-family:&quot;Times New Roman&quot;;font-size:medium;margin:10px 0px 0px;padding:0px;border-collapse:collapse;border-spacing:0px">
                    <tbody style="margin:0px;padding:0px">
                        <tr style="margin:0px;padding:0px">
                            <td style="padding:0px 0px 0px 10px;width:70px">
                                <p
                                    style="margin:0px 10px 0px 0px;padding:0px;font-family:proxima-nova,sans-serif;font-weight:lighter;font-size:12px;line-height:15px">
                                    Audited by</p>
                            </td>
                            <td style="padding:0px;width:50px"><img
                                    src="https://d396f6yqtfj97a.cloudfront.net/static/cyber-unit.png" alt="auditor"
                                    style="margin:0px;padding:0px;width:50px" class="CToWUd"></td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table cellpadding="0" cellspacing="0"
                    style="color:rgb(0,0,0);font-family:&quot;Times New Roman&quot;;font-size:medium;margin:10px 0px 0px;padding:0px;border-collapse:collapse;border-spacing:0px;border:none">
                    <tbody>
                        <tr style="margin:0px;padding:0px;background-color:rgb(37,37,42)">
                            <td style="padding:0px;max-width:107px"><a href="http://arc.market/"
                                    style="margin:0px;padding:0px" target="_blank"
                                    data-saferedirecturl="https://arc.market/&amp;source=gmail&amp;ust=1653629040670000&amp;usg=AOvVaw3r-ZMgx08W17qKX986bLn9"><img
                                        src="https://d396f6yqtfj97a.cloudfront.net/static/social01.png" alt="website"
                                        style="margin:0px;padding:0px;width:107px" class="CToWUd"></a>
                            </td>
                            <td style="padding:0px;max-width:493px"><a href="https://twitter.com/DeFi_ARC"
                                    style="margin:0px;padding:0px" target="_blank"
                                    data-saferedirecturl="https://twitter.com/DeFi_ARC&amp;source=gmail&amp;ust=1653629040670000&amp;usg=AOvVaw0k51f98A-jQBf_k5cjsVFl"><img
                                        src="https://d396f6yqtfj97a.cloudfront.net/static/social02.png" alt="twitter"
                                        style="margin:0px;padding:0px;width:493px" class="CToWUd"></a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </table>
</body>

  </html>`
}
}
