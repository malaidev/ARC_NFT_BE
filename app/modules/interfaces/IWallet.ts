export interface IWallet {
    address: string
    knownBalance?: string
    symbol?: string,
    title?: string
    network?: string
    type?: 'TOKEN' | 'ETHER'
}