const cloudinary= require("cloudinary").v2;

exports.uploadVideoToCloudinary= async(file, folder)=>{
    const options={
        folder:folder,
        resource_type:'auto'
    };

    return await cloudinary.uploader.upload(file.tempFilePath, options)
}