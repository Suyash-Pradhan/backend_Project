import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: 'dzefesi4j', 
    api_key: '554415288232761', 
    api_secret: '<your_api_secret>'
});
const UplodeonCloudnary = async (filepath) => {
    try{
        if(!filepath){return null;}
        const response =  await cloudinary.uploader.upload(filepath,{resource_type: "auto"});
        console.log("File is uploded on Cloudnary: ",response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(filepath);
        return null
        
    }
}
export default UplodeonCloudnary;