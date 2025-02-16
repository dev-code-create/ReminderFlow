import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createTeam,
  deleteTeam,
  getTeams,
  inviteMember,
  updateTeamMember,
  removeTeamMember,
} from "../controllers/teamController.js";

const router = express.Router();

router.post("/createTeam", authMiddleware, createTeam);
router.get("/getTeam", authMiddleware, getTeams);
router.post("/:id/invite", authMiddleware, inviteMember);
router.delete("/:teamId", authMiddleware, deleteTeam);
router.put("/:teamId/members/:memberId", authMiddleware, updateTeamMember);
router.delete("/:teamId/members/:memberId", authMiddleware, removeTeamMember);

export default router;
