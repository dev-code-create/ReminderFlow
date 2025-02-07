import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import "./services/cronJobs.js";
import { scheduleRecurringTask } from "./services/recurrenceTask.js";
import calenderRoutes from "./routes/calenderRoutes.js";
import calendarOauth from "./routes/calendarOauth.js";

scheduleRecurringTask();
dotenv.config();
mongoDB();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", authRoutes);
app.use("/api/task", authMiddleware, taskRoutes);
app.use("/api/calender", calenderRoutes);

app.use("/api/calendarAuth", calendarOauth);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
