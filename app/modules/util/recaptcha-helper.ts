import { config } from "../../config/config";




export const recaptchaVerification=async(recaptchaResponse:string)=>{
    const secret_key = config.google_recaptcha.server;
    const urlVerification=config.google_recaptcha.urlVerification;
    const axios = require("axios").default;
    try {
        const options = {
            method: 'POST',
            url: `${urlVerification}?secret=${secret_key}&response=${recaptchaResponse}`,
          };            
          
          const res= await   axios.request(options);

          if (res && res.status==200 && res.data && !res.data.success){
              return {
                  success:false,
                  error:res.data['error-codes']
              }
          }else{

          }
       
          

    } catch(error){
        console.log('-->>>>>',error);
        throw new Error(error);

    }
}
