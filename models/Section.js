const mongoose= require("mongoose");

const sectionSchema= new mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
    },
    sectionName:{
        type:String,
        required:true,
        maxlength:200,
        minlength:1,
        trim: true,
    },
    subSection:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref:'SubSection',
    }],
});

module.exports= mongoose.model("SectionSchema", sectionSchema);