const {instance}= require("../config/razorpay");
const Course= require("../models/Course");
const User= require("../models/User");
const mailSender= require("../utils/mailSender");
const mongoose= require("mongoose");
const { ObjectId } = require('mongodb');
const crypto= require("crypto");

//capture payment
exports.capturePayment= async(req,res)=>{
    try{
        //get courseID and userID
        const {courseId}= req.body;
        const userId= req.user.id; 

        //valid courseID, details
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:'courseID can\'t be empty',
            })
        };
        //validation
        let course
        try{
            course= await Course.findById(courseId);
            if(!course){
                return res.status(404).json({
                    success:false,
                    message:'No such course found!'
                })
            }
        } catch(error){
            return res.status(400).json({
                success:false,
                message:'Invalid Course ID',
            })
        }
    
        //check if user is already enrolled in the course or not
        const objectId = new ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:'User already enrolled in course!'
            })
        }
        //createOrder
        const amount= course.price;
        const currency="INR";

        const options={
            amount: amount*100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId:courseId,
                userId,
            }
        }

        try{
            //initiate the payment
            const payamentResponse= await instance.orders.create(options);
            console.log(payamentResponse);

            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription: course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:PaymentResponse.id,
                currency:PaymentResponse.currency,
                amount:PaymentResponse.amount,
            })
        } catch(err){
            return res.status(400).json({
                success:false,
                message:'Error while creating order!'
            })
        }
        //return response
    } catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Error while creating order!', 
        })
    }
};

//verify signature of razorpay with server
exports.verifySignature= async(req,res)=>{
    const webhookSecret="12345678";
    const signature= req.header["x-razorpay-signature"]; //this will be in a hashed format

    //so we convert our webhookSecret to the encrypted format so that we can compare it with the signature sent by razorpay
    const shasum= crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest= shasum.digest("hex");

    if(signature===digest){
        console.log("Payment is authorized!");

        const {courseId, userId}= req.body.payload.payment.entity.notes;

        try{
            //update Course
            const course1= await Course.findByIdAndUpdate(courseId, 
                                                            {
                                                                $push:{
                                                                    studentsEnrolled:userId,
                                                                }
                                                            },
                                                            {new:true},
            );
            if(!course1){
                return res.status(500).json({
                    success:false,
                    message:'Course not found!'
                });
            }

            console.log(course1);

            //update student
            const updatedStudent= await User.findByIdAndUpdate(userId,
                                                                {
                                                                    $push:{
                                                                        courses:courseId,
                                                                    }
                                                                },
                                                                {new:true},
            );
            console.log(updatedStudent);

            //send confirmation mail
            const emailResponse= await mailSender(updatedStudent.email,
                                                    "Congrats for entering the world of CodeSetGo!",
                                                    `<p>Enrolled in the course successfully!</p>`
            )

            return res.status(200).json({
                success:true,
                message:'Signature verified successfully!'
            })

        } catch(error){
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"Unable to verify transaction!",
        })
    }

}