import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  removeMember,
  createTeamTask,
  updateTeamTask,
  deleteTeamTask,
} from "../controllers/teamController.js";

const router = express.Router();

// Team routes
router.post("/", authMiddleware, createTeam);
router.get("/", authMiddleware, getTeams);
router.get("/:teamId", authMiddleware, getTeamById);
router.put("/:teamId", authMiddleware, updateTeam);
router.delete("/:teamId", authMiddleware, deleteTeam);

// Team member routes
router.post("/:teamId/members", authMiddleware, inviteMember);
router.delete("/:teamId/members/:memberId", authMiddleware, removeMember);

// Team task routes
router.post("/:teamId/tasks", authMiddleware, createTeamTask);
router.put("/:teamId/tasks/:taskId", authMiddleware, updateTeamTask);
router.delete("/:teamId/tasks/:taskId", authMiddleware, deleteTeamTask);

export default router;
