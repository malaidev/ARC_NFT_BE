import * as ccxt from 'ccxt';
import { IAPIKey } from '../interfaces/IAPIKey';

export async function isAPIKeyValid(key: IAPIKey) {
  // console.log('key valid: ', key)

  console.log('key de validação aqui: ', key)

  if(ccxt[key.id]){
    const exchange = new ccxt[key.id]();
    exchange.apiKey = key.apiKey;
    exchange.secret = key.apiSecret;

    if(key.id.toLowerCase() === 'kucoin'){
      exchange.password = key.passphrase
    }

    if (key.extraFields.length > 0) {
      const userSubAccount = key.extraFields.find(field => field.fieldName === 'Subaccount');
        if (userSubAccount?.value !== undefined) {
        exchange.headers = {
          'FTX-SUBACCOUNT': userSubAccount.value,
        }
      }
    }
    await exchange.checkRequiredCredentials();
    await exchange.fetchBalance();
} else throw new Error('CCXT::Invalid exchange ID');
}