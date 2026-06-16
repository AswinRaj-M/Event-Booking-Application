import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  fileType: String
});

export default fileSchema;
