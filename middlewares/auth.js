const jwt= require('jsonwebtoken');
require("dotenv").config();
const User= require("../models/User");

//auth
exports.auth= async(req,res,next)=>{
    try{
        //extract
        const token= req.cookies.token 
                    || req.body.token 
                    || req.header("Authorization").replace("Bearer ","");
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided, access denied, Login In again' });
        }

        try{
            const decode= jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user= decode;
        } catch(error){
            return res.status(401).json({
                success:false,
                message:'Token verification failed!'
            })
        }
        next();   
        
    } catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:'Some error occured while verifying token!'
        })
    }
}

//isStudnet
exports.isStudent= async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:'This is a protected route for students only'
            })
        }
        next();
    } catch(error){
        return res.status(500).json({
            success:false,
            message:'User role can\'t be verified!'
        })
    }
}

//isInstructor
exports.isInstructor= async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Instructors only'
            })
        }
        next();
    } catch(error){
        return res.status(500).json({
            success:false,
            message:'User role can\'t be verified!'
        })
    }
}

//isAdmin
exports.isAdmin= async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Admin only'
            })
        }
        next();
    } catch(error){
        return res.status(500).json({
            success:false,
            message:'User role can\'t be verified!'
        })
    }
}