import { sign } from './sign';

export const contract = async (router: any, options: any) => {
  router.get('/', sign);
};
