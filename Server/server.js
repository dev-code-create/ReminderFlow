import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import "./services/cronJobs.js";
import { scheduleRecurringTask } from "./services/recurrenceTask.js";
import calendarRoutes from "./routes/calendarRoutes.js";
import calendarOauth from "./routes/calendarOauth.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import userRoutes from "./routes/userRoutes.js";

scheduleRecurringTask();
dotenv.config();
mongoDB();
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/users", authRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/calendar", calendarRoutes);

app.use("/api/calendarAuth", calendarOauth);
app.use("/api/settings", settingsRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
