import { send } from './send'


const opts = {
  schema: {
    tags: ['Email']
  }
}

export const emailContact = async (router: any, options: any) => {
  router.post('/', opts,send);
}
