import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import connectDB from "./config/db.js"
import passport from "passport"
import "./config/passport.js"
import userRoutes from './routes/user.routes.js'
import adminRoutes from "./routes/admin.routes.js"
import vendorRoutes from "./routes/vendor.routes.js"
import commonRoutes from "./routes/common.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import { globalErrorHandler } from "./middleware/error.middleware.js"

import http from "http"
import { initSocket } from "./config/socket.js"

connectDB()

const app = express()

app.use(passport.initialize())

app.use(express.json())
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}))

app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/vendor", vendorRoutes)
app.use("/api/vendors", vendorRoutes)
app.use('/api/common', commonRoutes)
app.use("/api/payments", paymentRoutes)

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000

app.get("/", (req, res) => {
  res.send("FESTIVO")
})

const server = http.createServer(app)
initSocket(server)

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on: http://localhost:${PORT}`)
  const tunnelUrl = process.env.PUBLIC_TUNNEL_URL || "https://953308e66be29d.lhr.life";
  console.log(`Tunnel URL: ${tunnelUrl}`)
})  
