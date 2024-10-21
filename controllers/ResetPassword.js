const User= require("../models/User");
const mailSender= require("../utils/mailSender");
const bcrypt= require("bcrypt");

exports.resetPasswordToken= async(req,res)=>{
    try{
        //get email from req.body
        const {email}= req.body;

        // check user for this email, email validation
        const user= User.findOne({email});

        if(!user){
            return res.status(401).json({
                success:false,
                message: 'No user with this email found!'
            })
        }
        //generate token
        const token= crypto.randomUUID();

        // update user by adding token and expiry time
        const updatedDetails= await User.findOneAndUpdate(
                                                {email},
                                                {
                                                    token:token,
                                                    resetPasswordExpires: Date.now()+ 5*60*1000,
                                                },
                                                {new:true});


        //create url
        const url= `http://localhost:3000/update-password/${token}`;

        //send mail containing url
        await mailSender(email,
                        "Password Reset link",
                        `Click here to reset password- ${url}` )


        //return response
        return res.status(200).json({
            success:true,
            message:'Password reset link sent successfully!'

        })
    } catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:'Error occured while resseting password!'

        })
    }
    
}

exports.resetPassword= async(req,res)=>{
    try{
        //fetch data
        const {password, confirmPassword, token}= req.body;

        //validation
        if(password!==confirmPassword){
            return res.status(401).json({
                success:false,
                message:'Password not matching'
            })
        }

        //get user details from DB using token
        const userDetail= await User.findOne({token});
        
        //token validation
        if(!userDetail){
            return res.status(401).json({
                success:false,
                message:'Invalid Token'
    
            }); 
        }
        
        //token time check
        if(userDetail.resetPasswordExpires < Date.now()){
            return res.status(401).json({
                success:false,
                message:'Token has expired!'
    
            })
        
        }
        
        //hash PW
        const hashedPassword= bcrypt.hash(password,10);
        
        //updatePW
        userDetail.password= hashedPassword;
        await userDetail.save();

        return res.status(200).json({
            success:true,
            message:'Password reset successful!'
        })


    } catch(error){

    }
}