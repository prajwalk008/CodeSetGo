const mongoose= require("mongoose");

const subSectionSchema= new mongoose.Schema({
    sectionID:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    title:{
        type:String,
        required:true,
        maxlength:200,
        minlength:1,
        trim: true,
    },
    timeDuration:{
        type: String,
        required:true,
        trim: true,
    },
    description:{
        type: String,
        required:true,
        trim: true,
    },
    videoUrl:{
        type:String,
        required:true,
    },
});

module.exports= mongoose.model("SubSectionSchema", subSectionSchema); 