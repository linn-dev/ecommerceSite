import { v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file, folder = "product") => {
    try{
        const result = await cloudinary.uploader.upload(file.path, {
            folder: `ecommerce/${folder}`,
            resource_type: "auto",
            transformation: [
                { width: 1000, height: 1000, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" }
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_Id,
        }
    }catch (err) {
        throw new Error(`Cloudinary upload failed: ${err.message}`);
    }
}

//** Single delete from cloudinary **\\
export const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Delete failed error:', error);
    }
};

//** Bulk delete from cloudinary **\\
export const deleteMultipleFromCloudinary = async (publicIds) => {
    try {
        await cloudinary.api.delete_resources(publicIds);
    }catch(err) {
        console.error('Delete failed error: ', err);
    }
}

export default cloudinary;