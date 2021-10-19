import { send } from './send'


export const emailContact = async (router: any, options: any) => {
  router.post('/', send);
}
