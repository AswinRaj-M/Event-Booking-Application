import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"

dotenv.config()
connectDB()


const app = express()


app.use(express.json())
app.use(cookieParser());
app.use(cors({ origin : "httphttp://localhost:5173", credentials : true}))

const PORT = process.env.PORT || 5000


app.listen(PORT,()=>{
  console.log(`server is running on localhost : ${PORT}`)
})  
