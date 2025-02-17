import CalendarIntegration from "../models/calendarIntegration.model.js";
import { syncAllTasks } from "../services/calendarSync.js";
import { google } from "googleapis";
import Task from "../models/task.model.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/calendar/google/callback`
);

export const connectCalendar = async (req, res) => {
  try {
    const { provider, accessToken, refreshToken, expiresAt } = req.body;
    const userId = req.user.id;

    const calendarIntegration = await CalendarIntegration.findOneAndUpdate(
      { user: userId, provider: provider.toLowerCase() },
      {
        accessToken,
        refreshToken,
        expiresAt: new Date(expiresAt),
        syncEnabled: true,
        lastSyncAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Verify tasks exist
    const tasks = await Task.find({
      creator: userId,
      dueDate: { $exists: true, $ne: null },
    });
    console.log("Found tasks for sync:", tasks);

    // Immediately sync all tasks after connecting
    try {
      await syncAllTasks(userId);
      console.log("Tasks synced successfully after connection");
    } catch (syncError) {
      console.error("Initial sync failed:", syncError);
      console.error("Sync error details:", syncError.stack);
    }

    res.status(200).json({
      message: "Calendar connected successfully",
      integration: calendarIntegration,
      tasksFound: tasks.length,
    });
  } catch (error) {
    console.error("Calendar connection error:", error);
    res
      .status(500)
      .json({ message: "Failed to connect calendar", error: error.message });
  }
};

export const getCalendarIntegration = async (req, res) => {
  try {
    const calendarIntegration = await CalendarIntegration.findOne({
      user: req.user.id,
    }).populate("user");
    if (!calendarIntegration)
      return res.status(404).json({ message: "No calendar integration found" });
    res.json(calendarIntegration);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleSync = async (req, res) => {
  try {
    const calendarIntegration = await CalendarIntegration.findOne({
      user: req.user.id,
    });
    if (!calendarIntegration)
      return res.status(404).json({ message: "No calendar Integration Found" });
    calendarIntegration.syncEnabled = !calendarIntegration.syncEnabled;
    await calendarIntegration.save();
    res.json({
      message: `Sync ${
        calendarIntegration.syncEnabled ? "enabled" : "disabled"
      }`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const syncToCalendar = async (req, res) => {
  try {
    const userId = req.user.id;
    await syncAllTasks(userId);
    res.json({ message: "Tasks synced successfully" });
  } catch (error) {
    console.error("Sync error:", error);
    res
      .status(500)
      .json({ message: "Failed to sync tasks", error: error.message });
  }
};

export const initiateGoogleAuth = async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
    prompt: "consent",
    state: req.user.id,
  });
  res.json({ url: authUrl });
};

export const handleGoogleCallback = async (req, res) => {
  const { code, state } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens temporarily in session or use state parameter to identify user
    // For now, we'll redirect with the tokens as query parameters (not recommended for production)
    res.redirect(
      `${process.env.FRONTEND_URL}/calendar-sync?` +
        `access_token=${tokens.access_token}&` +
        `refresh_token=${tokens.refresh_token}&` +
        `expires_in=${tokens.expiry_date}`
    );
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(
      `${
        process.env.FRONTEND_URL
      }/calendar-sync?error=true&message=${encodeURIComponent(error.message)}`
    );
  }
};

export const getCalendarStatus = async (req, res) => {
  try {
    const integration = await CalendarIntegration.findOne({
      user: req.user.id,
    });
    res.json({ integration });
  } catch (error) {
    res.status(500).json({ message: "Failed to get status" });
  }
};
