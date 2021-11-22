export interface IAuthSigner {
  walletId: string;
  uuid?: string;
}

export interface IAuthSignerProps {
  uuid: string;
  timestamp: number;
  walletId: string;
  verified: boolean;
  signatureHash?: string;
}
