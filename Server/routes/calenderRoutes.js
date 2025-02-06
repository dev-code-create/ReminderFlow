import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  connectCalender,
  getCalenderIntegration,
  toggleSync,
} from "../controllers/calenderController.js";
const router = express.Router();

router.post("/connect", authMiddleware, connectCalender);
router.get("/CalenderDetails", authMiddleware, getCalenderIntegration);
router.put("/toggle-sync", authMiddleware, toggleSync);

export default router;
