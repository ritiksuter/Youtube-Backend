import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath);
        console.log("File uploaded to the cloudinary");
        return response;
    }
    catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("Some error occurred while uploading the file in the cloud");
    }
}

export { uploadOnCloudinary };