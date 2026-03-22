import multer from "multer"

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb) =>{
  const allowedTypes =[
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/svg+xml"
  ]

  if(allowedTypes.includes(file.mimetype)){
    cb(null,true)
  }else{
    cb(new Error("Only PDF, JPG, JPEG, PNG, and SVG files are allowed"),false)
  }
}

const upload = multer({
  storage,
  limits:{fileSize : 5 * 1024 * 1024},
  fileFilter,
})


export default upload