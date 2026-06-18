import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { errorHandler } from "./middlewares/error.middleware.js"

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import authRouter from './routes/auth.routes.js'
import attendanceRouter from './routes/attendance.routes.js'
import eventsRouter from './routes/events.routes.js'
import projectRouter from './routes/project.routes.js'
import chatRouter from './routes/chat.routes.js'
import aiRouter from './routes/ai.routes.js'

// routes declaration
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/attendance", attendanceRouter)
app.use("/api/v1/events", eventsRouter)
app.use("/api/v1/projects", projectRouter)
app.use("/api/v1/projects/:project_id/chat", chatRouter)
app.use("/api/v1/ai", aiRouter)

// Error Handler Middleware
app.use(errorHandler)

export { app };