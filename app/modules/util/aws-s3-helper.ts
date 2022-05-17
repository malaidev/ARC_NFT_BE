import { config } from "../../config/config";
const AWS =require('aws-sdk');
const s3_key=config.aws.s3_key;
const s3_secret=config.aws.s3_secret;
const s3_bucket = config.aws.s3_user_bucket;
const cloudfront = 'https://d1ymw6k8ugpy6v.cloudfront.net';
const configParams={accessKeyId:s3_key,secretAccessKey: s3_secret,signatureVersion: 'v4'};
const { RekognitionClient, CompareFacesCommand ,DetectModerationLabelsCommand} = require("@aws-sdk/client-rekognition");
const checkModeration=async (params,S3object)=>{
   return new Promise((resolve, reject) => {
      const rekognition = new AWS.Rekognition({...params,region:'us-east-1'});
      rekognition.detectModerationLabels({
                "Image": {
                    "S3Object":S3object
                },
                "MinConfidence": 10,
      },(err,data)=>{
         resolve(data)
      })
    })
};
export const S3uploadImageBase64 = async(data,fileName,contentType,folder) => {
   let base64Data;
   if (contentType.includes("image")){
      base64Data = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
   };
   if (contentType.includes("video")){
      base64Data = Buffer.from(data.replace(/^data:video\/\w+;base64,/, ""), 'base64');
   };
   if (contentType.includes("audio")){
      base64Data = Buffer.from(data.replace(/^data:audio\/\w+;base64,/, ""), 'base64');
   };
   if (contentType.includes("text")){
      base64Data = Buffer.from(data.replace(/^data:text\/\w+;base64,/, ""), 'base64');
   };
    const type = data.split(';')[0].split('/')[1];
    AWS.config.update(configParams);
    const s3bucket = new AWS.S3({accessKeyId:s3_key,secretAccessKey:s3_secret});
    let nameFile =  new Date().getTime(); //`${fileName.replace(/[^a-zA-Z ]/g, "")}`;
    const params = {
        Bucket: s3_bucket,
        Key:  `${folder}/${nameFile}.${type}`,
        Body: base64Data,
        ACL: 'public-read', // change to public
        ContentEncoding: 'base64', // required
        ContentType: contentType??`image/${type}` // required. Notice the back ticks
      }
      let location = '';
      let key = '';
      let url =''
      try {
        const { Location,Key}= await s3bucket.upload(params).promise();
        location = `${cloudfront}/${Key}`;   
        const isEx = await checkModeration(params, {"Bucket": s3_bucket,"Name": `${Key}` ,})
         return {
            location:location,
            moderateData:isEx && isEx['ModerationLabels'] ? isEx['ModerationLabels']:null,
            explicit:isEx && isEx['ModerationLabels'].length>1?true:false
         }
      } catch (error) {
         console.log(error)
      }
      // return location;
}
export const S3GetSignedUrl=async(key)=>{
    AWS.config.update(configParams);
    const s3bucket = new AWS.S3({accessKeyId:s3_key,secretAccessKey:s3_secret});
      let url=''
      try {
         url = await s3bucket.getSignedUrl('getObject', {
            Bucket: s3_bucket,
            Key: key,
            Expires: 86400,
        });
      } catch (error) {
         console.log(error)
      }
      // Save the Location (url) to your database and Key if needs be.
      // As good developers, we should return the url and let other function do the saving to database etc
      return url;
}
