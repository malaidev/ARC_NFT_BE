import { config } from "../../config/config";
const AWS =require('aws-sdk');
const s3_key=config.aws.s3_key;
const s3_secret=config.aws.s3_secret;


const s3 = new AWS.S3({
    accessKeyId:s3_key,
    secretAccessKey:s3_secret
})
export const uploadImage = async(data) => {
    
    const upl = s3.putObject({
        
    })
}
