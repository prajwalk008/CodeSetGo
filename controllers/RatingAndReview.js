const RatingAndReview= require("../models/RatingAndReviews");
const Course= require("../models/Course");

//create rating 
exports.createRating= async(req,res)=>{
    try{
        //get userid
        const userId= req.user.id;

        //fetch data from req.body 
        const {rating,review,courseID} =req.body;

        //check if user is enrolled in course or not
        const courseDetails= await Course.findOne(
                                    {courseID,
                                        studentsEnrolled:{$elemMatch:{$eq:userId}},
                                    }
        );
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course'
            })
        }

        //check if user has not reviewed the course
        const alredyReviewed= await RatingAndReview.findOne({
                                                    user:userId,
                                                    course:courseID,

        })
        if(alredyReviewed){
            return res.status(403).json({
                success:false,
                message:'Course is already reviwed by the user'
            })
        }

        //create rating and review
        const ratingReview= await RatingAndReview.create({
                                                rating,review,
                                                course:courseID,
                                                user:userId,
        });

        //add this rating and review in the course
        await Course.findByIdAndDelete({courseID},
                                        {
                                            $push:{
                                                ratingAndReviews:ratingReview._id,
                                            }
                                        },
                                        {new:true},
        )
        //return response
        return res.status(200).json({
            success:true,
            message:'Rating and review created successfully!',
            ratingReview
        })


    } catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//avg rating
exports.getAverageRating= async(req,res)=>{
    try{
        //get Course id
        const courseId= req.body.courseID;
        //calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: { $avg: "$rating"},
                }
            }
        ])
        //return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })

        }
        else{
            return res.status(200).json({
                success:true,
                messaage:'No rating till now',
                averageRating:0,
            })
        }
    } catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//getAllRatings
exports.getAllRatings= async(req,res)=>{
    try{
        const allReviews= await RatingAndReview.find({})
                                    .sort({rating:"desc" })
                                    .populate({
                                        path:"user",
                                        select:"firstname lastname email image"
                                    })
                                    .populate({
                                        path:"course",
                                        select:"courseName",
                                    })
                                    .exec();
        
        return res.status(200).json({
            success:true,
            message:'All reviews fetched!',
            data:allReviews,
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}