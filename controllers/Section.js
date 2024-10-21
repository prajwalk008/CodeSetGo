const SubSection= require("../models/SubSection"); 
const Section= require("../models/Section");
const Course= require("../models/Course");
const mongoose= require("mongoose");
const uploadVideoToCloudinary= require("../utils/videoUploader");


//create section
exports.createSection= async(req,res)=>{
    try{
        const {courseID,sectionName}= req.body;

        if(!sectionName || !courseID){
            return res.status(500).json({
                success:false,
                message: 'Section name or CourseID can\'t be empty ',
            });
        }

        const Section1= await Section.create({
            sectionName,
        })

        const updatedCourse= await Course.findByIdAndUpdate({courseID},
            {
                $push:{
                    courseContent:Section1._id,
                }
            },
            {new:true},
        ).populate({
            path: 'courseContent',
            populate: {
                path: 'subSection', // Assuming 'subSection' is a field in your 'Section' model
            },
        });
        

        return res.status(200).json({
            success:true,
            message:'Section created successfully!',
            updatedCourse,
        })

        // const secID= Section1._id;

        // for(let sub1 of subSection){
        //     const video = req.files.video1;
        //     if (!video) {
        //         return res.status(400).json({
        //             success: false,
        //             message: `No video found for subsection: ${sub1.title}`,
        //         });
        //     }
        //     const response= await uploadVideoToCloudinary(video, "Codehelp");

        //     const subEntry1= await SubSection.create({
        //         sectionID:secID,
        //         title: sub1.title,
        //         timeDuration:sub1.timeDuration,
        //         description:sub1.description,
        //         videoUrl: response.secure_url,
        //     })

        //     await Section.findByIdAndUpdate({secID},
        //         {
        //             $push:{
        //                 subSection: subEntry1._id,
        //             }
        //         }, 
        //         {new:true},
        //     );
        // }



    } catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Unable to create section',
            error:error.message,
        });
    }
};


//Update section
exports.updateSection= async(req,res)=>{ 
    try{
        const {sectionName,sectionId}= req.body;
        if(!sectionName || !sectionId){
            return res.status(500).json({
                success:false,
                message: 'Section name or section content can\'t be empty ',
            });
        }

        const Section1= await Section.findByIdAndUpdate(sectionId, {sectionName},{new:true});

        return res.status(200).json({
            success:true,
            message:'Section updated successfully!'
        })

    } catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Unable to update section',
            error:error.message, 
        });
    }
}

//delete section

exports.deleteSection= async(req,res)=>{
    try{
        //sending data in params
        const {sectionId}= req.params;

        if(!sectionId){
            return res.status(500).json({
                success:false,
                message: 'Section name or section content can\'t be empty ',
            });
        }

        const thisSection= await Section.findByIdAndDelete({sectionId});
        await Course.updateOne(
            { courseContent: sectionId },    // Filter: courses that have this section ID in their 'sections' array
            { $pull: { courseContent: sectionId } }  // Update: remove the section ID from the array
        );
        return res.status(200).json({
            success:true,
            message:'Section deleted successfully!'
        })


    } catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Unable to update section',
            error:error.message, 
        });
    }
}