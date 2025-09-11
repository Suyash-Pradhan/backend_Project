import { v2 as cloudinary } from 'cloudinary';
import fs, { fstatSync } from 'fs';
import { ApiError } from '../utils/ApiError.js';

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

        if (fileSizeinMB > 100) {
            throw new ApiError(400, 'File limit exceed')
        }

        const response = await cloudinary.uploader.upload(filepath, {
            resource_type: "auto",
            // chunk_size: 6000000
        }, (error, result) => {
            if (error) {
                console.error("Upload large error:", error);

            }
            else {
                console.log(" File uploded successfuly");

            };
        })

        console.log("video ke length duration", response);


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