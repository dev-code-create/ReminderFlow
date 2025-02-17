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

// Public route for Google OAuth callback
router.get("/google/callback", handleGoogleCallback);

// Protected routes
router.get("/auth/google", authMiddleware, initiateGoogleAuth);
router.get("/status", authMiddleware, getCalendarStatus);
router.post("/connect", authMiddleware, connectCalendar);
router.post("/sync-to-calendar", authMiddleware, syncToCalendar);
router.put("/toggle-sync", authMiddleware, toggleSync);
router.post(
  "/pull-from-calendar",
  authMiddleware,
  syncEventsFromGoogleCalendar
);

export default router;
