const mongoose= require("mongoose");

const courseSchema= new mongoose.Schema({
    courseName:{ 
        type:String,
        required:true,
        maxlength:500,
        minlength:1,
        trim: true,
    },
    discription:{
        type: String,
        required:true,
        maxlength:5000,
        minlength:1,
        trim: true,
    },
    instructor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    wYWL:{
        type:String,
        required:true,
        maxlength:2000,
        minlength:1,
    },
    courseContent:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Section",
    }],
    ratingAndReviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview"
        }
    ],
    price:{
        type: Number,
        required: true,
        max:10000,
        min:0,
    },
    thumbnail:{
        type:String, // Image URL
        required:true,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    tags:{
        type:String,
        maxlength:500,
        trim:true,
    },
    studentsEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    ],
    status:{
        type:String,
        enum:["drafted","published"],
    },
});

module.exports= mongoose.model("Course", courseSchema); 