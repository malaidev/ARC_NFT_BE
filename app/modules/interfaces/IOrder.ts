import { IAPIKey } from './IAPIKey';

export interface IOrder {
  symbolPair?: string;
  orderType?: 'MARKET' | 'LIMIT',
  offerType?: 'BUY' | 'SELL',
  amount?: string;
  price?: number,
  user?: {
    address: string;
    details: {
      exchanges: IAPIKey[];
    }
  };
}
