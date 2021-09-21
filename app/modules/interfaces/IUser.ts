import { IAPIKey } from "./IAPIKey";
import { IAuthorizedBrowser } from "./IAuthorizedBrowser";
import { IPlatformSettings } from "./IPlatformSettings";
import { IWallet } from "./IWallet";

export interface IUser {
    _id?: string
    name?: string
    createdAt?: Date
    wallets?: Array<IWallet>
    settings?: IPlatformSettings
    lastLogin?: Date
    exchanges?: Array<IAPIKey>
    authorizedBrowsers?: Array<IAuthorizedBrowser>
    [key: string]: any
}
