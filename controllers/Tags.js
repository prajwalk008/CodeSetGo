const Category = require("../models/Category");

exports.createCategory= async(req,res)=>{
    try{
        const {name,description}= req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All feilds are required!',
            })
        }

        //create entry in DB
        const catDetail= await Category.create({
            name,
            description,
        });
        console.log(catDetail);

        return res.status(200).json({
            success:true,
            message:'Category created successfully!'
        })


    } catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message,
        })
    }
};

//getAllTags
exports.showAllCategories= async(req,res)=>{
    try{
        const allCats= await Category.find({}, {name:true, description:true}); //a tag must contain name and description
        res.status(200).json({
            success:true,
            message:'All categories fetched successfully!',
            allCats,
        })
    }catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message,
        })
    }
}

exports.categoryPageDetails= async(req,res)=>{
    try{
        //get categoryID
        const {categoryId}= req.body;

        //fetch all courses of a category
        const selectedCategory= await Category.findById(categoryId).populate("course").exec();

        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:'Data not found',
            })
        }

        //get courses for diff cats
        const differentCategories= await Category.find({
            _id:{$ne:categoryId}  //categories that are not equal to this category!
        }).populate('course').exec();

        //suggest top selling courses

        //return response   
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            },
        });
    } catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message,
        })
    }
}