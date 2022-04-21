
export interface IPerson {
  _id?: string;                         // user id
  photoUrl: string;                     // photo image url
  wallet: string;                       // wallet address
  username?: string;                    // username
  bio?: string;                         // bio of user
  social?: string;                      // social link of user
  nonce?:number
}
