import { google } from "googleapis";
import axios from "axios";
import Task from "../models/task.model.js";
import CalendarIntegration from "../models/calendarIntegration.model.js";

// Google Calendar Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/calendar/google/callback`
);

// Sync tasks to calendar
const syncTaskToCalendar = async (userId, task) => {
  try {
    const integration = await CalendarIntegration.findOne({
      user: userId,
      syncEnabled: true,
    });

    if (!integration) return;

    if (integration.provider === "google") {
      await syncToGoogleCalendar(integration, task);
    }
  } catch (error) {
    console.error("Calendar sync error:", error);
  }
};

// Sync all tasks
const syncAllTasks = async (userId) => {
  try {
    const integration = await CalendarIntegration.findOne({
      user: userId,
      provider: "google",
      syncEnabled: true,
    });

    if (!integration) {
      console.log("No active Google Calendar integration found");
      return;
    }

    // Get all pending and in-progress tasks
    const tasks = await Task.find({
      creator: userId,
      dueDate: { $exists: true, $ne: null }, // Only sync tasks with due dates
    }).exec();

    if (tasks.length === 0) {
      console.log("No tasks found with due dates");
      return;
    }

    for (const task of tasks) {
      try {
        console.log("Attempting to sync task:", {
          id: task._id,
          title: task.title,
          dueDate: task.dueDate,
          status: task.status,
        });
        await syncToGoogleCalendar(integration, task);
      } catch (error) {
        console.error(`Failed to sync task ${task.title}:`, error);
        continue;
      }
    }

    // Update last sync time
    await CalendarIntegration.findByIdAndUpdate(integration._id, {
      lastSyncAt: new Date(),
    });
    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Sync all tasks error:", error);
    throw error;
  }
};

// Pull events from calendar
const pullFromCalendar = async (userId) => {
  try {
    const integration = await CalendarIntegration.findOne({
      user: userId,
      provider: "google",
      syncEnabled: true,
    });

    if (!integration) {
      console.log("No active Google Calendar integration found");
      return;
    }

    if (!integration.accessToken) {
      console.error("No access token found for integration");
      return;
    }

    await pullFromGoogleCalendar(integration, userId);
  } catch (error) {
    console.error("Calendar pull error:", error);
    throw error;
  }
};

// Google Calendar Functions
async function syncToGoogleCalendar(integration, task) {
  try {
    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Format the task date properly
    const taskDate = new Date(task.dueDate);
    const endDate = new Date(taskDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const event = {
      summary: task.title,
      description: task.description || "No description provided",
      start: {
        dateTime: taskDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: true, // Use default reminders instead of custom
      },
      // Make the event visible
      visibility: "public",
      transparency: "opaque",
      // Add metadata
      extendedProperties: {
        private: {
          taskId: task._id.toString(),
          source: "ReminderFlow",
        },
      },
    };

    try {
      const result = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      console.log("Event created successfully:", result.data);
    } catch (apiError) {
      console.error("Google Calendar API Error:", {
        code: apiError.code,
        message: apiError.message,
        errors: apiError.errors,
      });
      throw apiError;
    }
  } catch (error) {
    console.error("Error in syncToGoogleCalendar:", error);
    throw error;
  }
}

async function pullFromGoogleCalendar(userId) {
  try {
    const integration = await CalendarIntegration.findOne({
      user: userId,
      provider: "google",
      syncEnabled: true,
    });

    if (!integration) {
      console.log("No active Google Calendar integration found");
      return;
    }

    oauth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Get events from the last 24 hours and upcoming
    const timeMin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin,
      maxResults: 100,
      singleEvents: true,
      orderBy: "startTime",
    });

    for (const event of response.data.items) {
      // Skip events that are already from ReminderFlow
      if (event.extendedProperties?.private?.source === "ReminderFlow") {
        continue;
      }

      await Task.findOneAndUpdate(
        {
          creator: userId,
          calendarEventId: event.id,
        },
        {
          $setOnInsert: {
            title: event.summary || "Untitled Event",
            description: event.description || "",
            dueDate: new Date(event.start.dateTime || event.start.date),
            creator: userId,
            status: "pending",
            calendarEventId: event.id,
            source: "google_calendar",
          },
        },
        { upsert: true, new: true }
      );
    }

    // Update last sync time
    await CalendarIntegration.findByIdAndUpdate(integration._id, {
      lastSyncAt: new Date(),
    });
  } catch (error) {
    console.error("Error pulling from Google Calendar:", error);
    throw error;
  }
}

// Export all functions at the bottom
export {
  syncTaskToCalendar,
  syncAllTasks,
  pullFromCalendar,
  pullFromGoogleCalendar,
};
