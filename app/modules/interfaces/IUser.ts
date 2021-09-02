import { IAPIKeys } from "./IAPIKeys";
import { IPlatformSettings } from "./IPlatformSettings";
import { IWallet } from "./IWallet";

export interface IUser {
    _id?: string
    name?: string
    createdAt?: Date
    wallets?: Array<IWallet>
    settings?: IPlatformSettings
    lastLogin?: Date
    exchanges?: Array<IAPIKeys>
    [key: string]: any
}