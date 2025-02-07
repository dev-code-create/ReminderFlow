import express from "express";
import { createTask, getTasks } from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createTask", createTask);
router.post("/getTask", getTasks);
router.delete("/:taskId", authMiddleware, deleteTask);

export default router;
