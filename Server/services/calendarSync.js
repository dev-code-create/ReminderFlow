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
    } else if (integration.provider === "outlook") {
      await syncToOutlookCalendar(integration, task);
    }
  } catch (error) {
    console.error("Calendar sync error:", error);
  }
};

// Sync all tasks
const syncAllTasks = async (userId) => {
  try {
    // Convert string ID to ObjectId if needed
    const tasks = await Task.find({
      creator: userId,
    }).exec();

    if (!tasks.length) {
      console.log("No tasks found for user:", userId);
      return;
    }

    for (const task of tasks) {
      await syncTaskToCalendar(userId, task);
    }
  } catch (error) {
    console.error("Sync all tasks error:", error);
    throw error; // Propagate error to controller
  }
};

// Pull events from calendar
const pullFromCalendar = async (userId) => {
  try {
    const integration = await CalendarIntegration.findOne({
      user: userId,
      syncEnabled: true,
    });

    if (!integration) return;

    if (integration.provider === "google") {
      await pullFromGoogleCalendar(integration, userId);
    } else if (integration.provider === "outlook") {
      await pullFromOutlookCalendar(integration, userId);
    }
  } catch (error) {
    console.error("Pull from calendar error:", error);
  }
};

// Google Calendar Functions
async function syncToGoogleCalendar(integration, task) {
  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary: task.title,
    description: task.description,
    start: {
      dateTime: task.dueDate,
      timeZone: "UTC",
    },
    end: {
      dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60000),
      timeZone: "UTC",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 30 },
      ],
    },
  };

  await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });
}

// Outlook Calendar Functions
async function syncToOutlookCalendar(integration, task) {
  const endpoint = "https://graph.microsoft.com/v1.0/me/events";

  const event = {
    subject: task.title,
    body: {
      contentType: "text",
      content: task.description,
    },
    start: {
      dateTime: task.dueDate,
      timeZone: "UTC",
    },
    end: {
      dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60000),
      timeZone: "UTC",
    },
    reminderMinutesBeforeStart: 30,
  };

  await axios.post(endpoint, event, {
    headers: {
      Authorization: `Bearer ${integration.accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

async function pullFromGoogleCalendar(integration, userId) {
  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: "startTime",
  });

  for (const event of response.data.items) {
    await Task.findOneAndUpdate(
      {
        creator: userId,
        title: event.summary,
        dueDate: new Date(event.start.dateTime),
      },
      {
        $setOnInsert: {
          title: event.summary,
          description: event.description,
          dueDate: new Date(event.start.dateTime),
          creator: userId,
          status: "pending",
        },
      },
      { upsert: true, new: true }
    );
  }
}

async function pullFromOutlookCalendar(integration, userId) {
  const endpoint = "https://graph.microsoft.com/v1.0/me/events";

  const response = await axios.get(endpoint, {
    headers: {
      Authorization: `Bearer ${integration.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  for (const event of response.data.value) {
    await Task.findOneAndUpdate(
      {
        creator: userId,
        title: event.subject,
        dueDate: new Date(event.start.dateTime),
      },
      {
        $setOnInsert: {
          title: event.subject,
          description: event.body.content,
          dueDate: new Date(event.start.dateTime),
          creator: userId,
          status: "pending",
        },
      },
      { upsert: true, new: true }
    );
  }
}

// Single export statement for all functions
export {
  syncTaskToCalendar,
  syncAllTasks,
  pullFromCalendar,
  pullFromGoogleCalendar as syncEventsFromGoogleCalendar,
};
