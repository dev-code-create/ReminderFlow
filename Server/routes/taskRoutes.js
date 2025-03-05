import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskStatus,
  getTask,
} from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ReminderEmail } from "../services/cronJobs.js";

const router = express.Router();

router.post("/createTask", createTask);
router.get("/getTask", getTasks);
router.delete("/:taskId", authMiddleware, deleteTask);
router.put("/:taskId/status", authMiddleware, updateTaskStatus);
router.get("/:taskId", authMiddleware, getTask);
router.get("/cron", ReminderEmail);

export default router;
