import CalendarIntegration from "../models/calendarIntegration.model.js";
import { syncAllTasks } from "../services/calendarSync.js";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/calendar/google/callback`
);

export const connectCalendar = async (req, res) => {
  try {
    const { provider } = req.body;
    const userId = req.user.id;

    const calendarIntegration = await CalendarIntegration.findOneAndUpdate(
      { user: userId, provider: provider.toLowerCase() },
      {
        syncEnabled: true,
        lastSyncAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // After connecting, sync all tasks
    await syncAllTasks(userId);

    res.status(200).json({
      message: "Calendar connected successfully",
      integration: calendarIntegration,
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
      "https://www.googleapis.com/auth/calendar.events", // Just for events
      "https://www.googleapis.com/auth/calendar.readonly", // Read-only access
    ],
    prompt: "consent",
  });
  res.json({ url: authUrl });
};

export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);

    await CalendarIntegration.findOneAndUpdate(
      { user: req.user.id, provider: "google" },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + (tokens.expiry_date || 3600000)),
        syncEnabled: true,
      },
      { upsert: true, new: true }
    );

    // Redirect with success
    res.redirect(`${process.env.FRONTEND_URL}/calendar-sync?success=true`);
  } catch (error) {
    console.error("Google callback error:", error);
    // Redirect with error details
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
