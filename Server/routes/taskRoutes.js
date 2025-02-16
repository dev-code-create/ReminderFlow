import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskStatus,
} from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createTask", createTask);
router.get("/getTask", getTasks);
router.delete("/:taskId", authMiddleware, deleteTask);
router.put("/:taskId/status", authMiddleware, updateTaskStatus);

export default router;
