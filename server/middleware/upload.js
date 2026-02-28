import multer from "multer"

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb) =>{
  const allowedTypes =[
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png"
  ]

  if(allowedTypes.includes(file.mimetype)){
    cb(null,true)
  }else{
    cb(new Error("only pdf jpg jpeg png files are allowed"),false)
  }
}

const upload = multer({
  storage,
  limits:{fileSize : 2 * 1024 * 1024},
  fileFilter,
})


export default upload