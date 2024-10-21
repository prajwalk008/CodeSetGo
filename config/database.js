const mongoose= require('mongoose');
require("dotenv").config(); //This line loads environment variables from a .env file into 'process.env'.

exports.connect= ()=>{
    mongoose.connect(process.env.DB_URL)
    .then(()=> console.log("DB connected successfully!"))
    .catch((error)=>{
        console.log("DB Connection failed");
        console.error(error);
        process.exit(1);
    })
};
