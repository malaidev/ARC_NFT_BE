import { IWallet } from "./IWallet";

export interface IPlatformSettings {
    defaultWallet?: IWallet
    defaultToken?: string
    theme?: string
}