import express from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import deliveryPartnerRouter from "./routes/deliveryPartnerRoute.js"
import swaggerUi from 'swagger-ui-express'
import { readFileSync } from 'fs'
import path from 'path'
const swaggerDoc = JSON.parse(readFileSync(new URL('./swagger.json', import.meta.url)))

// app config
const app = express()
const port = process.env.PORT || 4000;


// middlewares
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// api endpoints
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images", express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/delivery-partner", deliveryPartnerRouter)

// serve static files from frontend and admin builds
app.use(express.static(path.join(process.cwd(), 'frontend/dist')))
app.use(express.static(path.join(process.cwd(), 'admin/dist')))

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))