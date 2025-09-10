import { v2 as cloudinary } from 'cloudinary';
import fs, { fstatSync } from 'fs';
import { ApiError } from '../utils/ApiError.js';
import { rejects } from 'assert';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const UplodeonCloudnary = async (filepath) => {
    try {
        if (!filepath) { return null; }

        if (!fs.existsSync(filepath)) {
            throw new ApiError(400, 'File does not exists')
        }

        const stats = fs.statSync(filepath)
        const fileSizeinMB = stats.size / (1024 * 1024)
        let response;
        if (fileSizeinMB > 100) {
            console.log("Large file detected");
            const uploadResult = await new Promise((resolve,rejects)=>{

                response =  cloudinary.uploader.upload_large(filepath, {
                    resource_type: "auto",
                    chunk_size: 6000000
                });

                response.on('end', (data) => {
                    resolve(data);
                })
                response.on('error', (data) => {
                    rejects(data);
                })
            })
            console.log("video ke length duration", uploadResult);
        }
        else {

            response = await cloudinary.uploader.upload(filepath, { resource_type: "auto" });

        }
        // console.log("File is uploded on Cloudnary: ", response.url);
        fs.unlinkSync(filepath);

        return response;
    }
    catch (error) {
        console.error("Error while uploading on cloudnary: ", error);
        if (fs.existsSync(filepath)) {

            fs.unlinkSync(filepath);
        }
        return null

    }
}
export default UplodeonCloudnary;