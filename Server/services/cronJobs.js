import cron from "node-cron";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import CalendarIntegration from "../models/calendarIntegration.model.js";
import { sendEmail } from "./email.js";
import { sendPushNotification } from "./push.js";
import { syncTaskToCalendar, pullFromGoogleCalendar } from "./calendarSync.js";
import google from "googleapis";
import { format } from "date-fns";

// Run every minute to check for due tasks
export const ReminderEmail = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Find tasks that are due and haven't sent reminders
      const tasks = await Task.find({
        dueDate: { $lte: now },
        status: { $ne: "completed" },
        reminderSent: { $ne: true },
      }).populate("creator");

      for (const task of tasks) {
        // Send email reminder if enabled
        if (task.creator.notificationPreferences.email) {
          try {
            const formattedDueDate = format(
              new Date(task.dueDate),
              "MMMM d, yyyy"
            );
            const formattedDueTime = task.dueTime || "No specific time";

            const emailSubject = "Task Reminder: Action Required";
            const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563EB;">Task Reminder</h2>
              <p>Hello ${task.creator.firstName},</p>
              <p>This is a reminder that your task is due:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">${task.title}</h3>
                <p style="color: #4b5563;">${
                  task.description || "No description provided"
                }</p>
                <p style="color: #4b5563;">
                  <strong>Due Date:</strong> ${formattedDueDate}<br>
                  <strong>Due Time:</strong> ${formattedDueTime}<br>
                  <strong>Priority:</strong> ${task.priority}
                </p>
              </div>

              <p>Please complete this task as soon as possible.</p>
              <p>Best regards,<br>ReminderFlow Team</p>
            </div>
          `;

            await sendEmail(task.creator.email, emailSubject, emailHtml);

            console.log(`Email reminder sent for task: ${task.title}`);
          } catch (emailError) {
            console.error("Failed to send email reminder:", emailError);
          }
        }

        // Mark reminder as sent
        task.reminderSent = true;
        await task.save();
      }
    } catch (error) {
      console.error("Task reminder cron error:", error);
    }
  });
};

// Schedule calendar sync every 15 minutes
export const startCalendarSync = () => {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const integrations = await CalendarIntegration.find({
        syncEnabled: true,
      });

      for (const integration of integrations) {
        try {
          // Pull events from calendar
          await pullFromGoogleCalendar(integration.user);

          // Get user's tasks that need syncing
          const tasks = await Task.find({
            creator: integration.user,
            dueDate: { $exists: true },
          });

          // Sync each task to calendar
          for (const task of tasks) {
            if (task.needsCalendarSync()) {
              try {
                await syncTaskToCalendar(task, integration);
              } catch (taskError) {
                console.error(`Failed to sync task ${task._id}:`, taskError);
              }
            }
          }
        } catch (userError) {
          console.error(
            `Failed to sync calendar for user ${integration.user}:`,
            userError
          );
        }
      }
    } catch (error) {
      console.error("Calendar sync cron job error:", error);
    }
  });
};

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
