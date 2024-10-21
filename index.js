const express= require("express");
require("dotenv").config();

const userRoutes= require("./routes/User");
const profileRoutes= require("./routes/Profile");
const paymentRoutes= require("./routes/Payments");
const CourseRoutes= require("./routes/Course");

const cookieParser= require("cookie-parser");
const cors = require("cors");

const cloudinary= require("./config/cloudinary");
const database= require("./config/database");
const fileUpload= require("express-fileupload");


const app= express();
const PORT= process.env.PORT||4000;

//middlewares

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}));
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)
app.use(cookieParser());// adding cookieParser middleware!
app.use(express.json());

database.connect();

cloudinary.cloudinaryConnect();

//routes
app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/payment",paymentRoutes);
app.use("/api/v1/course",CourseRoutes);

app.get("/", (req,res)=>{
    return res.json({
        success:true,
        message:'This is home page'
    })
})

app.listen(PORT,()=>{
    console.log(`App is listning on ${PORT}`);
});