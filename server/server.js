import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import userRoutes from './routes/user.routes.js'

dotenv.config()
connectDB()


const app = express()


app.use(express.json())
app.use(cookieParser());
app.use(cors({ origin : "http://localhost:5173", credentials : true}))

app.use("/api/users",userRoutes)

const PORT = process.env.PORT || 5000


app.listen(PORT,()=>{
  console.log(`server is running on localhost : ${PORT}`)
})  
