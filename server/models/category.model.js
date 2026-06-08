import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  fileUrl : {
    type : String,
    required : true
  },
  publicId :{
    type : String,
    required : true
  },
  fileType : String
})

const categorySchema =  new mongoose.Schema({
  name : {
    type : String,
    required : true,
    unique : true
  },
  description :{
    type  : String,
    required : true
  },
  categoryIcon : {
    type : fileSchema,
    required : true
  },
  isActive :{
    type : Boolean,
    default : true
  },
  isDeleted : {
    type : Boolean,
    default : false
  },
  
},{timestamps : true})


const Category = mongoose.model("category",categorySchema)

export default Category