import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  connectCalender,
  getCalenderIntegration,
  toggleSync,
} from "../controllers/calenderController";
const router = express.Router();

router.post("/connect", authMiddleware, connectCalender);
router.get("/get", authMiddleware, getCalenderIntegration);
router.put("/toggle-sync", authMiddleware, toggleSync);

export default router;
