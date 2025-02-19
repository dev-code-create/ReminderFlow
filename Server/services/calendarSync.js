import { google } from "googleapis";
import Task from "../models/task.model.js";
import CalendarIntegration from "../models/calendarIntegration.model.js";

// Google Calendar Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/api/calendar/google/callback`
);

// Sync a single task to calendar
export const syncTaskToCalendar = async (task, calendarIntegration) => {
  try {
    oauth2Client.setCredentials({
      access_token: calendarIntegration.accessToken,
      refresh_token: calendarIntegration.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Format the task date properly
    const taskDate = new Date(task.dueDate);
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(":");
      taskDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    }
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
        useDefault: true,
      },
      visibility: "public",
      transparency: "opaque",
      extendedProperties: {
        private: {
          taskId: task._id.toString(),
          source: "ReminderFlow",
        },
      },
    };

    // If task already has a calendar event, update it
    if (task.calendarEventId) {
      await calendar.events.update({
        calendarId: "primary",
        eventId: task.calendarEventId,
        resource: event,
      });
    } else {
      // Create new calendar event
      const response = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      await task.updateCalendarSync(response.data.id);
    }

    return true;
  } catch (error) {
    console.error("Calendar sync error:", error);
    await task.setCalendarSyncError(error);
    throw error;
  }
};

// Sync all tasks for a user
export const syncAllTasks = async (userId) => {
  try {
    const integration = await CalendarIntegration.findOne({
      user: userId,
      syncEnabled: true,
    });

    if (!integration) {
      console.log("No active calendar integration found for user");
      return;
    }

    const tasks = await Task.find({
      $or: [{ creator: userId }, { assignees: userId }],
      dueDate: { $exists: true },
    });

    for (const task of tasks) {
      if (task.needsCalendarSync()) {
        try {
          await syncTaskToCalendar(task, integration);
        } catch (error) {
          console.error(`Failed to sync task ${task._id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Sync all tasks error:", error);
    throw error;
  }
};

// Pull events from Google Calendar
export const pullFromGoogleCalendar = async (userId) => {
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
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + 7);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin,
      timeMax: timeMax.toISOString(),
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
            dueTime: event.start.dateTime
              ? new Date(event.start.dateTime).toTimeString().slice(0, 5)
              : null,
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

    return response.data.items;
  } catch (error) {
    console.error("Error pulling from Google Calendar:", error);
    throw error;
  }
};
