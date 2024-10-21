const mongoose= require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema= new mongoose.Schema({
    email:{
        type: String,
        required:true,
        trim: true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    },
});

// function to send E-mail
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse= await mailSender(email, "Email Verification | SkillSetGo", otp);
    }
    catch(error){
        console.log("Error occured while sending mail", error);
        throw error;
    }
}

otpSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next(); 
})

module.exports= mongoose.model("OTP", otpSchema); 