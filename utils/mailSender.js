const nodemailer= require("nodemailer");

const mailSender= async(email, title, body)=>{
    try{
        let transporter= nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASSWORD,
            }
        })

        const info = await transporter.sendMail({
            from: '"Prajwal @ SkillSetGo" <prajwalkambale85@gmail.com>', // sender address
            to: email, // list of receivers
            subject: `${title}`, // Subject line 
            html: `${body}`, // html body
        });

        console.log(info);
        return info;
    }
    catch(error){
        console.log(error.message); 
    }
}

module.exports= mailSender;