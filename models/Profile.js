const mongoose= require("mongoose");

const profileSchema= new mongoose.Schema({
    gender:{
        type:String,
        maxlength:50,
        minlength:1,
        trim: true,
    },
    DOB:{
        type: String,
        trim: true,
    },
    about:{
        type: String,
        maxlength:500,
        trim: true,
    },
    contactNumber:{
        type:Number,    
        trim:true,
    },
});

module.exports= mongoose.model("Profile", profileSchema); 