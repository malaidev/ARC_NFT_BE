import { AbstractEntity } from "../abstract/AbstractEntity";
import { IAPIKey } from "../interfaces/IAPIKey";

export class ExchangeApiKeyController extends AbstractEntity {
    protected data: IAPIKey;
    protected table: 'User';

    constructor(data?: IAPIKey) {
        super();
        this.data = data
    }

}