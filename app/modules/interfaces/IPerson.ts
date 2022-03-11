import { INFTSimple } from "./INFT";

export interface IPerson {
  _id?: string;                         // user id
  photoUrl: string;                     // photo image url
  wallet: string;                       // wallet address
  username?: string;                     // username
  bio?: string;                  // display name
  social?: string;

  nfts: Array<INFTSimple>;              // owned nfts - collection and index
  collections: Array<string>;             // collection contract address list
}

// const IPersonSchema = new mongoose.Schema<IPerson>( {
//   backgroundUrl: String,
//   photoUrl: String,
//   wallet: String,
//   joinedDate: Date,
//   username: String,
//   displayName: String,

//   nfts: [{
//     ref: 'NFT',
//     type: ObjectId
//   }],
//   created: [{
//     ref: 'NFT',
//     type: ObjectId
//   }],
//   favourites: [{
//     ref: 'NFT',
//     type: ObjectId
//   }],
//   history: [{
//     ref: 'History',
//     type: ObjectId
//   }],
// });

// export const PersonModel = mongoose.model<IPerson>('Person', IPersonSchema);
