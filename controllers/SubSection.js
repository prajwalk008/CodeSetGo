const SubSection= require("../models/SubSection");
const Section= require("../models/Section");
const uploadVideoToCloudinary= require("../utils/videoUploader");

const convertDurationToHHMMSS = (durationInSeconds) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);
  
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
  
    return `${hoursStr}:${minutesStr}:${secondsStr}`;
  };

//create Subsection
exports.createSubSection= async(req,res)=>{
    try{
        //fetch data
        const {sectionId, title, description}= req.body;
        const video= req.files.video1;

        //validation
        if(!sectionId || !title || !duration || !description){
            return res.status(400).json({
                success:false,
                message:'All feilds are required!'
            })
        }

        if(!video){
            return res.status(400).json({
                success:false,
                message:'Video is required!'
            })
        }

        //upload vdo to cloudinary
        try{
            const response= await uploadVideoToCloudinary(video, `Codehelp`);
        }
        catch(err){
            console.error(err);
            return res.status(500).json({
                success:false,
                message:'Video upload failed!'
            })
        }
        
        //getting time duration of video
        const videoDuration = response.duration; // time dur. in seconds
        const duration= convertDurationToHHMMSS(videoDuration);

        //create a subsection
        const subEntry1= await SubSection.create({
            sectionID:sectionId,
            title:title,
            timeDuration:duration,
            description:description,
            videoUrl: response.secure_url,
        })

        //update data in mongoDB
        const res2=await Section.findByIdAndUpdate(sectionId,
            {
                $push:{
                    subSection: subEntry1._id,
                }
            }, 
            {new:true},
        ).populate("subSection");

        //return res
        return res.status(200).json({
            success:true,
            message:'Subsection created!',
            res2,
        })
    } catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Error occured while creating section',
            error:error.message, 
        })
    }
};

//updateSubSection

const deleteVideoFromCloudinary = async (videoUrl) => {
    const publicId = videoUrl.split('/').pop().split('.')[0]; // Extract public ID from the URL
    await cloudinary.uploader.destroy(publicId);
};
  
exports.updateSubSection = async (req, res) => {
    try {
      const { id } = req.params; // Get subsection ID from the URL
      const updates = req.body; // Get updated data from the request body
      const existingSubsection = await SubSection.findById(id);
  
      if (!existingSubsection) {
        return res.status(404).json({
          success: false,
          message: 'Subsection not found',
        });
      }
  
      // Check for new video upload
      if (req.files && req.files.video) {
        const video = req.files.video;
  
        // Delete old video from Cloudinary
        await deleteVideoFromCloudinary(existingSubsection.videoUrl);
  
        // Upload new video to Cloudinary
        const response = await uploadVideoToCloudinary(video, 'subsection_videos');
        updates.videoUrl = response.secure_url; // Update with new video URL
      }
  
      // Update only the fields that were provided in the request
      const updatedSubsection = await SubSection.findByIdAndUpdate(
        id,
        {
          title: updates.title || existingSubsection.title,
          duration: updates.duration || existingSubsection.duration,
          description: updates.description || existingSubsection.description,
          videoUrl: updates.videoUrl || existingSubsection.videoUrl,
        },
        { new: true, runValidators: true }
      );
  
      // Return the updated subsection
      res.status(200).json({
        success: true,
        message: 'Subsection updated successfully',
        data: updatedSubsection,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Error updating subsection',
        });
    }
};

//delete subSection!
exports.deleteSubSection= async(req,res)=>{
    try{
        const SubSectionId= req.params;
        
        if(!SubSectionId){
            return res.status(404).json({
                success:false,
                message:'Subsection ID not provided'
            })
        }

        const SS= await SubSection.findById(SubSectionId);
        if(!SS){
            if(!response){
                return res.status(404).json({
                    success:false,
                    message:'No SubSection for this ID found!'
                })
            }
        }

        const SectionId= SS.sectionID;

        try{
            await SubSection.deleteOne(SubSectionId);

        } catch(err){
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Error deleting data!',
            });
        }

        await Section.updateOne(
            { _id: SectionId},   
            { $pull: { subSection: SubSectionId} }  // Update: remove the Subsection ID from the array
        );



    } catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subsection',
        });
    }
}