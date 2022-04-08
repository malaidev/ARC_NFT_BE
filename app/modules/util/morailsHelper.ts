
import { config } from "../../config/config";
const Moralis = require('moralis/node');

const serverUrl = config.moralis.server_url||"https://zuamhrw01nef.usemoralis.com:2053/server";
const appId = config.moralis.appid|| "lkUu0BI4e5x7c1Ed1vbWR8aT2OkJguMb9cm75pBb";
const masterKey = config.moralis.master_key||"6E1ibTletQ4lE7MrbFlRPTQ6u37PhSQH2u8Ifwfb";

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