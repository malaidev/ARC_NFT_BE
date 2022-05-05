import { config } from "../../config/config";
const AWS =require('aws-sdk');
const s3_key=config.aws.s3_key;
const s3_secret=config.aws.s3_secret;
const s3_bucket = config.aws.s3_user_bucket;
const cloudfront = 'https://d1ymw6k8ugpy6v.cloudfront.net';
const configParams={accessKeyId:s3_key,secretAccessKey: s3_secret,signatureVersion: 'v4'};
export const S3uploadImageBase64 = async(data,fileName,contentType,folder) => {
    const base64Data = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
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
      } catch (error) {
         console.log(error)
      }
      
      return location;
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
