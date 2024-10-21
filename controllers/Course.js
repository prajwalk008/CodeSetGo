const Course= require("../models/Course");   
const Tags = require("../models/Category");
const Tag= require("../models/Category");
const User= require("../models/User");
const uploadImageToCloudinary= require("../utils/imageUploader");

//Create Course
exports.createCourse= async(req,res)=>{
    try{
        const {courseName, courseDescription, wYWL, price, tag}= req.body;

        //thumbnail
        const thumbnail= req.files.thumbnailImage;

        if(!courseName || !courseDescription ||!wYWL || !price || !tag || !thumbnail){
            return res.status(500).json({
                success:false,
                message:'All feilds are required!'
            })
        }

        //check Instructor so that we get instructor id to save it in course collection
        const userID= req.user.id;
        const instructorDetails= await User.findById({userID});
        console.log("Instructor details: ",instructorDetails);

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:'No user of this ID found!'
            })
        }

        //check tag validity
        const tagDetail= await Tag.findById({tag});
        if(!tagDetail){
            return res.status(404).json({
                success:false,
                message:'Invalid Tag',
            })
        }

        //upload image to cloudinary
        const thumbnailImage= await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //creating entry in DB
        const newCourse= await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            wYWL,
            price,
            tag:tagDetail._id,
            thumbnail: thumbnailImage.secure_url,

        })

        //add new course to userSchema of instructor
        await User.findByIdAndUpdate({_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            }, 
            {new:true},
        );

        //Update Tags Schema
        await Tags.findByIdAndUpdate({_id:tag},
            {
                $push:{
                    course: newCourse._id,
                }
            },
            {new:true},
        );

        return res.status(200).json({
            success:true,
            message:'Course created successfully!',
            data: newCourse,
        });

    } catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Error occured while creating course',
            error: error.message,
        });
    }
}

//Fetch all courses

exports.showAllCourse= async(req,res)=>{
    try{
        const allCourses= Course.find({}, {courseName:true, 
                                            price:true,
                                            thumbnail:true,
                                            instructor:true,
                                            ratingAndReviews:true,
                                            studentsEnrolled:true,}
        ).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:'Data for all courses fetched successfully!',
            data:allCourses,
        })



    } catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Error occured while fetching all courses!',
            error: error.message,
        });
    }
};

exports.getCourseDetails = async (req, res) => {
    try {
            //get id
            const {courseId} = req.body;
            //find course details
            const courseDetails = await Course.find(
                                        {_id:courseId})
                                        .populate(
                                            {
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                },
                                            }
                                        )
                                        .populate("category")
                                        .populate("ratingAndreviews")
                                        .populate({
                                            path:"courseContent",
                                            populate:{
                                                path:"subSection",
                                            },
                                        })
                                        .exec();

                //validation
                if(!courseDetails) {
                    return res.status(400).json({
                        success:false,
                        message:`Could not find the course with ${courseId}`,
                    });
                }
                //return response
                return res.status(200).json({
                    success:true,
                    message:"Course Details fetched successfully",
                    data:courseDetails,
                })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
} 