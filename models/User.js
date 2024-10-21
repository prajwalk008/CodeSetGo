const mongoose= require("mongoose");

const userSchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        maxlength:50,
        minlength:1,
        trim: true,
    },
    lastName:{
        type: String,
        required:true,
        maxlength:50,
        minlength:1,
        trim: true,
    },
    email:{
        type: String,
        required:true,
        trim: true,
    },
    password:{
        type:String,
        required:true,
    },
    accountType:{
        type:String,
        required:true,
        enum:["Admin", "Student", "Instructor"],
    },
    additionalDeatils:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Profile",
    },
    courses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ],
    image:{
        type:String, // Image URL
        required:true,

    },
    token:{
        type:String
    },
    resetPasswordExpires:{
        type:Date
    },
    courseProgress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress",
        }
    ]
});

module.exports= mongoose.model("User", userSchema); 