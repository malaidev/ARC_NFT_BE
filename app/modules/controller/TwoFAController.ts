import { IQueryFilters } from "../interfaces/Query";
import { IUser } from "../interfaces/IUser";
import { respond } from "../util/respond";
import { IResponse } from "../interfaces/IResponse";
import { AbstractEntity } from "../abstract/AbstractEntity";
import { IAPIKey } from "../interfaces/IAPIKey";
import { CryptoJsHandler } from "../util/CryptoJsHandler";
import { IAuthorizedBrowser } from "../interfaces/IAuthorizedBrowser";
import { BrowserIdentityHandler } from "../util/BrowserIdendityHandler";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
export class TwoFaController extends AbstractEntity{
    protected data: IUser;
    protected userTable="Users";
    protected appName="arc.market";
    constructor(user?: IUser) {
        super();
        this.data = user;
      }
    async generateTwoFa(walletId:string){
        try {
            const secretCode = speakeasy.generateSecret({
                name: this.appName,
              });
              const collection = this.mongodb.collection(this.userTable);
              const findUserQuery={ wallets: {$elemMatch: {address: walletId,}}};
              await collection.updateOne(
                findUserQuery,{$set:{twoFactorAuthenticationCode:secretCode.base32}}
              );
              const qr = await QRCode.toDataURL(secretCode.otpauth_url);
              return respond({
                wallet:walletId,
                otpauthUrl: secretCode.otpauth_url,
                base32: secretCode.base32,
                qr
              });
        } catch (error) {
            return respond("Something bad happened.", true, 500);
          }
    }
    async turnOnTwoFactorAuthentication(walletId:string,twoFactorAuthenticationCode:string){
        const collection = this.mongodb.collection(this.userTable);
        const findUserQuery={ wallets: {$elemMatch: {address: walletId,}}};
        const userData = await collection.findOne(findUserQuery) as IUser;

        // if (userData && !userData.verified){
        //     return respond("Please Verify ", true, 401);
        // }

        const isCodeValid = await this.verifyTwoFactorAuthenticationCode(
            twoFactorAuthenticationCode, userData
          );
        if (!isCodeValid){
            return respond("Wrong  TFA token ", true, 401);
        }
        await collection.updateOne(
            findUserQuery,{$set:{isTwoFactorAuthenticationEnabled:true}}
          );
        return respond(isCodeValid);
    }
    async twoFactorAuthencticate(walletId:string,twoFactorAuthenticationCode:string):Promise<void|IResponse>{
        const collection = this.mongodb.collection(this.userTable);
        const findUserQuery={ wallets: {$elemMatch: {address: walletId,}}};
        const userData = await collection.findOne(findUserQuery) as IUser;          
        return  await this.verifyTwoFactorAuthenticationCode(
            twoFactorAuthenticationCode, userData
          );
    }
    private async verifyTwoFactorAuthenticationCode(twoFactorAuthenticationCode: string,user:IUser) {
        return speakeasy.totp.verify({
          secret: user.twoFactorAuthenticationCode,
          encoding: 'base32',
          token: twoFactorAuthenticationCode,
        });
      }
}