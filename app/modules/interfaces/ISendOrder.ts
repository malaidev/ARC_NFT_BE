import { IOrder } from './IOrder';

export interface ISendOrder {
  marketType: string;
  order: IOrder
}