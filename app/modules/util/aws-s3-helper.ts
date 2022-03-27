import { config } from "../../config/config";
const AWS =require('aws-sdk');
const s3_key=config.aws.s3_key;
const s3_secret=config.aws.s3_secret;
const s3_bucket = config.aws.s3_user_bucket;
const configParams={accessKeyId:s3_key,secretAccessKey: s3_secret,signatureVersion: 'v4'};
export const S3uploadImageBase64 = async(data,wallet) => {
    const base64Data = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = data.split(';')[0].split('/')[1];
    
    
    
    AWS.config.update(configParams);
    const s3bucket = new AWS.S3({accessKeyId:s3_key,secretAccessKey:s3_secret});
    const params = {
        Bucket: s3_bucket,
        Key: `${wallet}`,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64', // required
        ContentType: `image/${type}` // required. Notice the back ticks
      }
      let location = '';
      let key = '';
      let url =''
      try {
        const { Location, Key } = await s3bucket.upload(params).promise();
        location = Location;
        key = Key;
        //  url = await s3bucket.getSignedUrl('getObject', {
        //     Bucket: s3_bucket,
        //     Key: Key,
        //     Expires: 60 * 5
        // });
      } catch (error) {
         console.log(error)
      }
      // Save the Location (url) to your database and Key if needs be.
      // As good developers, we should return the url and let other function do the saving to database etc
      return location;
}
