const User= require("../models/User");
const OTP= require("../models/OTP");
const Profile= require("../models/Profile");
const otpGenerator= require("otp-generator");
const mongoose= require("mongoose");
const bcrypt= require("bcrypt");
const jwt= require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require('cookie-parser');
const { parsePhoneNumberFromString } = require('libphonenumber-js'); // google lib to validate phone numbers
const { resolve } = require("path/posix");

//E-mail validation
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

//phNumber validation
function validatePhoneNumber(phone) {
    const phoneNumber = parsePhoneNumberFromString(phone);
    return phoneNumber && phoneNumber.isValid();
}


//send OTP
exports.sendOTP= async(req,res)=>{

    try{
        const {email}= req.body; // fetch email from req.body

        const checkUserPresent= await User.findOne({email}); //finding email in DB

        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message: 'User alredy exist, please Login!'
            })
        }

        //OTP generation
        let otp= otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        
        const result= await OTP.findOne({otp});

        while(result){
            otp= otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result= await OTP.findOne({otp});
        }
        console.log("OTP=",otp);
        // The while loop method is a bad method, we can use services which create a unique OTP each time. 

        //saving in DB
        const Otp= await OTP.create({
            email,
            otp,    
        })

        //response
        return res.status(200).json({
            success:true,
            otp:otp,
            message:"OTP generated successfully"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Error Occured!'
        })
    }
    
};

// Sign-up

exports.signUp=  async(req,res)=>{

    try{
        //Fetch data
        const {accountType, 
            firstName,
            lastName, 
            email, 
            password, 
            repPassword, 
            phNumber, 
            otp,  
        }= req.body;

        //Validations
        if(!firstName){
            return res.status(401).json({
                success:false,
                message:'First Name can\'t be empty!'
            })
        }
        if(!lastName){
            return res.status(401).json({
                success:false,
                message:'Last Name can\'t be empty!'
            })
        }
        if(!email){
            return res.status(401).json({
                success:false,
                message:'E-mail can\'t be empty!'
            })
        }
        if(!validateEmail(email)){
            return res.status(401).json({
                success:false,
                message:'Incorect E-mail format!'
            })
        }
        if(!password){
            return res.status(401).json({
                success:false,
                message:'Password can\'t be empty!'
            })
        }
        if(!repPassword){
            return res.status(401).json({
                success:false,
                message:'Confirm Password can\'t be empty!'
            })
        }
        if(password!==repPassword){
            return res.status(401).json({
                success:false,
                message:'Password and Confirmed Password are different!'
            })
        }

        if(!validatePhoneNumber(phNumber)){
            return res.status(401).json({
                success:false,
                message:'Phone number is Invalid!'
            })
        }
        if(!otp){
            return res.status(401).json({
                success:false,
                message:'OTP can\'t be empty!'
            })
        }

        //User Seacrh
        const result= User.find({email});
        // console.log("result-",result);
        // console.log("Result ends")
        //const res2= User.findOne({phNumber});
        
        if(result.length===0){
            return res.status(401).json({
                success:false,
                message:'User with same E-mail already exist!'
            })
        }

        //OTP search
        const recentOTP= await OTP.find({email}).sort({createdAt:-1}).limit(1);
        // (createdAt:-1) => does the decreasing order sort i.e, most recent result is at the top.
        // (limit(1))=> gives only one result i.e, the top most result!

        //OTP Validation
        if(recentOTP.length==0){
            return res.status(401).json({
                success:false,
                message:'No valid OTP found!'
            })
        }
        console.log("recentOTP- ",recentOTP[0].otp);
        if(otp!==recentOTP[0].otp){
            return res.status(401).json({
                success:false,
                message:'Incorrect OTP!'
            })
        }

        //Password hashing
        const hashedPassword= await bcrypt.hash(password,10); // await is used bcoz bcrypt.hash() is a asynchronous fxn

        const newProfile= await Profile.create({
            gender:null,
            DOB:null,
            about:null,
            contactNumber:phNumber,
        })
        //Saving in DB
        const user= await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            additionalDeatils:newProfile._id,
            image:`https://api.dicebear.com/9.x/identicon/svg?seed=${firstName}`,
        })

        return res.status(200).json({
            success:true,
            message:"Signed Up successfully!",
            user,
        })

    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"Some Error occured!"
        })
    }
};

//Login
exports.login= async(req,res)=>{
    try{
        const {email, password}= req.body;

        if(!validateEmail(email)){
            return res.status(401).json({
                success:false,
                message:'Incorect E-mail format!'
            })
        }

        const user= User.findOne({email});

        if(!user){
            return res.status(401).json({
                success:false,
                message:'No user found! please sign Up!'
            })
        }
        else{
            const payload={
                email:user.email,
                id:user._id, // we store id so that we can pull all data of user from our DB.
                role:user.accountType,
            };
    
            bcrypt.compare(password,user.password, function(err,isMatch){
                if(err){
                    throw err;
                }
                if(isMatch){
                    let token= jwt.sign(payload, 
                                        process.env.JWT_SECRET, 
                                        { expiresIn:"2h" }
                                    );
                    
                    user= user.toObject(); //converts to object, just in case!
                    user.token= token;
                    user.password= null; 
                    
                    const options={
                        expires: new Date(Date.now() + 3*24*60*60*1000), //time to expire cookie
                        httpOnly:true,
                    }
                    res.cookie("token",token, options).status(200).json({
                    // res.cookie(a,b,c)=>
                            //a=> name of cookie
                            //b=> value of cookie
                            //c=> options
                        success:true,
                        token,
                        user,
                        message:"User Logged in Successfully!"
                    });
    
                    // res.status(200).json({
                    //     success:true,
                    //     token,
                    //     existingUser,
                    //     message:"User Logged in Successfully!"
                    // });
                }
                else{
                    return res.status(500).json({
                        success:false,
                        message:'Incorrect Password Entered!'
                    })
                }
            });
        }

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login failed!'
        });
    }


};

//change Password
exports.changePassword= async(req,res)=>{
    try{
        const token= req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");     

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided, access denied, Login In again' });
        }

        try{
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).json({ success: false, message: 'Invalid token!' });
                }
        
                // Token is valid, you can access decoded data
                const email = decoded.email; // Get email from decoded token
                // Continue with your logic
                res.json({ success: true, email });
            });
        } catch(error){
            return res.status(401).json({
                success:false,
                message:'Token verification failed!'
            })
        }


        const {newPw, conPw}= req.body;

        if(newPw!==conPw){
            return res.status(401).json({
                success:false,
                message:'New Password is not same as Confirmed password!'
            })
        }
        const user= await User.findOne({email});

        const hashedPassword= await bcrypt.hash(password,10);

        user.password= hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully!'
        });

    } catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating the password.'
        });
    }
}