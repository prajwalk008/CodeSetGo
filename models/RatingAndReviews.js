const mongoose= require("mongoose");

const ratingAndReview= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    rating:{
        type: Number,
        required:true,
        max:5,
        min:0,
    },
    review:{
        type: String,
        required:true,
        trim: true,
        maxlength:500,
        minlength:1,
    },
    course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true,
	},
});

module.exports= mongoose.model("RatingAndReview", ratingAndReview); 