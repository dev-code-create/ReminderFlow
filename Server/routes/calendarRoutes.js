import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  connectCalendar,
  syncToCalendar,
  toggleSync,
  initiateGoogleAuth,
  handleGoogleCallback,
  getCalendarStatus,
} from "../controllers/calendarController.js";
import {
  syncAllTasks,
  pullFromCalendar as syncEventsFromGoogleCalendar,
} from "../services/calendarSync.js";
const router = express.Router();

router.post("/connect", authMiddleware, connectCalendar);
router.post("/sync-to-calendar", authMiddleware, syncToCalendar);
router.put("/toggle-sync", authMiddleware, toggleSync);
router.post(
  "/pull-from-calendar",
  authMiddleware,
  syncEventsFromGoogleCalendar
);
router.get("/auth/google", authMiddleware, initiateGoogleAuth);
router.get("/auth/google/callback", authMiddleware, handleGoogleCallback);
router.get("/status", authMiddleware, getCalendarStatus);

export default router;
