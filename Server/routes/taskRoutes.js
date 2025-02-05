import express from "express";
import { createTask, getTasks } from "../controllers/taskController";

const router = express.Router();

router.post("/createTask", createTask);
router.post("/getTask", getTasks);

export default router;
