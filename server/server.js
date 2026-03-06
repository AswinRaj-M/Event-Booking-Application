import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import userRoutes from './routes/user.routes.js'
import adminRoutes from "./routes/admin.routes.js"
import vendorRoutes from "./routes/vendor.routes.js"


connectDB()


const app = express()


app.use(express.json())
app.use(cookieParser());
app.use(cors({ 
  origin : process.env.CLIENT_PORT,
  credentials : true
}))

app.use("/api/users",userRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api/vendor",vendorRoutes)

const PORT = process.env.PORT || 5000

app.get("/",(req,res)=>{
  res.send("FESTIVO")
})

app.listen(PORT,'0.0.0.0',()=>{
  console.log(`server is running on localhost : ${PORT}`)
})  
