import cron from "node-cron";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import CalendarIntegration from "../models/calendarIntegration.model.js";
import { sendEmail } from "./email.js";
import { sendPushNotification } from "./push.js";
import { syncTaskToCalendar, pullFromCalendar } from "./calendarSync.js";
import google from "googleapis";

// Run every minute to check for due tasks
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const tasks = await Task.find({
      dueDate: { $lte: now },
      status: { $ne: "completed" },
      reminderSent: { $ne: true },
    }).populate("creator");

    for (const task of tasks) {
      // Send email reminder
      if (task.creator.notificationPreferences.email) {
        await sendEmail(task.creator.email, {
          subject: "Task Reminder",
          text: `Your task "${task.title}" is due now!`,
          html: `<h1>Task Reminder</h1><p>Your task "${task.title}" is due now!</p>`,
        });
      }

      // Send push notification
      if (task.creator.notificationPreferences.push) {
        await sendPushNotification(task.creator.id, {
          title: "Task Due",
          body: `Your task "${task.title}" is due now!`,
        });
      }

      // Mark reminder as sent
      task.reminderSent = true;
      await task.save();
    }
  } catch (error) {
    console.error("Task reminder cron error:", error);
  }
});

// Sync calendars every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  try {
    const integrations = await CalendarIntegration.find({
      syncEnabled: true,
    }).populate("user");

    for (const integration of integrations) {
      // Pull events from calendar
      await pullFromCalendar(integration.user._id);

      // Sync tasks to calendar
      const tasks = await Task.find({
        creator: integration.user._id,
        updatedAt: {
          $gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
        },
      });

      for (const task of tasks) {
        await syncTaskToCalendar(integration.user._id, task);
      }

      // Update last sync time
      integration.lastSyncAt = new Date();
      await integration.save();
    }
  } catch (error) {
    console.error("Calendar sync cron error:", error);
  }
});

// Clean up old completed tasks monthly
cron.schedule("0 0 1 * *", async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Task.deleteMany({
      status: "completed",
      updatedAt: { $lt: thirtyDaysAgo },
    });
  } catch (error) {
    console.error("Task cleanup cron error:", error);
  }
});

// Update the token refresh cron job with proper refresh logic
cron.schedule("0 0 * * *", async () => {
  try {
    const integrations = await CalendarIntegration.find({
      expiresAt: { $lt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    }).populate("user");

    for (const integration of integrations) {
      try {
        if (integration.provider === "google" && integration.refreshToken) {
          // Refresh Google token using the refresh token
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.BACKEND_URL}/api/calendar/google/callback`
          );

          oauth2Client.setCredentials({
            refresh_token: integration.refreshToken,
          });

          const { credentials } = await oauth2Client.refreshAccessToken();

          integration.accessToken = credentials.access_token;
          integration.expiresAt = new Date(
            Date.now() + credentials.expiry_date
          );
          await integration.save();
        }
      } catch (refreshError) {
        console.error(
          `Token refresh error for user ${integration.user._id}:`,
          refreshError
        );
        integration.syncEnabled = false;
        await integration.save();
      }
    }
  } catch (error) {
    console.error("Token refresh cron error:", error);
  }
});
