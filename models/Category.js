const mongoose= require("mongoose");

const categorySchema= new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        maxlength:50,
        minlength:1,
        trim: true,
    },
    discription:{
        type: String,
        maxlength:500,
        trim: true,
    },
    course:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }],
});

module.exports= mongoose.model("Category", categorySchema); 