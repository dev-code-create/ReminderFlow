import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createTeam,
  getTeam,
  inviteMember,
} from "../controllers/teamController";

const router = express.Router();

router.post("/createTeam", authMiddleware, createTeam);
router.get("/getTeam", authMiddleware, getTeam);
router.post("/:id/invite", authMiddleware, inviteMember);

export default router;
