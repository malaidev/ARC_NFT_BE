
import { config } from "../../config/config";
const Moralis = require('moralis/node');

const serverUrl = config.moralis.server_url||"https://jwksmmpbgzix.usemoralis.com:2053/server";
const appId = config.moralis.appid|| "3D0QHtYtj2MW6zTtsVwHMLFjclv9NIbxfaXsOLw9";
const masterKey = config.moralis.master_key||"zal41dCVEObOt0OAk5ZreGyKWuDv1ThbouLCeWtL";

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