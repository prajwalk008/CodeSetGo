const Profile= require("../models/Profile");
const User= require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//update Profile
exports.updateProfile= async(req,res)=>{
    try{
        //fetch data from req.body
        const {DOB="",about="", contactNumber="",gender=""}= req.body;

        //fetch data of user form token
        const id= req.user.id;

        //validation
        if(!id){
            return res.status(400).json({
                success:false,
                message:'Unable to find the ID!'
            })
        }

        //find profile
        const userDetails= await User.findById(id);
        const profileID= userDetails.additionalDeatils;
        const profileDetails= await Profile.findById(profileID);

        //update profile
        profileDetails.DOB=DOB;
        profileDetails.gender=gender;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;

        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:'Profile Deatails updated successfully!',
            profileDetails
        })
    } catch(error){
        console.error(error);
        return res.status(400).json({
            success:false,
            message:'Profile update failed'
        })
    }
};

exports.deleteAccount= async(req,res)=>{
    try{
        //get id
        const id=req.user.id;

        //check valid id
        const response= await User.findById(id);
        if(!response){
            return res.status(400).json({
                success:false,
                message:'User not found!'
            })
        }

        //email verification through otp
        //delete profile, from student enrolled in different courses, course progress
        await Profile.findByIdAndDelete(response.additionalDeatils);

        const arr= response.courses;
        for(course of arr){
            const c1= await Course.findById(course);
            await Course.updateOne(
                { _id: c1},   
                { $pull: {studentsEnrolled: id} }  // Update: remove the Subsection ID from the array
            );
        }

        //delete user
        await User.findByIdAndDelete(id);

        //send response
        return res.status(200).json({
            success:true,
            message:'User Deleted!'
        })
    } catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to delete the user!'
        })
    }
};

exports.getAllUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};