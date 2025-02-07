import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createTeam,
  deleteTeam,
  getTeam,
  inviteMember,
} from "../controllers/teamController";
import { validateTask } from "../middleware/validation";
import { deleteTask } from "../controllers/taskController";

const router = express.Router();

router.post("/createTeam", authMiddleware, validateTask, createTeam);
router.get("/getTeam", authMiddleware, getTeam);
router.post("/:id/invite", authMiddleware, inviteMember);
router.delete("/:teamId", authMiddleware, deleteTeam);
router.delete("/:taskId", authMiddleware, deleteTask);

export default router;
