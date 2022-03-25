// import { Moralis } from "moralis";
const Moralis = require('moralis/node');
const serverUrl = "https://jwksmmpbgzix.usemoralis.com:2053/server";
const appId = "3D0QHtYtj2MW6zTtsVwHMLFjclv9NIbxfaXsOLw9";
const masterKey = "zal41dCVEObOt0OAk5ZreGyKWuDv1ThbouLCeWtL";

export const uploadImage = async(data) => {
  await Moralis.start({ serverUrl, appId, masterKey });

  const file = new Moralis.File(data.name, data);
  await file.saveIPFS();
  return file.url();
}

export const uploadImageBase64=async(data)=>{
  await Moralis.start({ serverUrl, appId, masterKey });
  const file = new Moralis.File(data.name, {base64 : data.img });
  await file.saveIPFS({useMasterKey:true});
  return file.url();
}