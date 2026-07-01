import mongoose, { mongo } from "mongoose";

const userOtpSchema = new mongoose.Schema({
  userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
  },
  otp : {
    type : String,
    required : true
  },
  tempEmail : {
    type : String
  },
  email : {
    type : String
  },
  createdAt :{
    type : Date,
    default : Date.now,
    expires : 300
  }
})

const Otp = mongoose.model("Otp",userOtpSchema)
export default Otp