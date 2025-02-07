import { google } from "googleapis";
import CalenderIntegration from "../models/calenderIntegration.model.js";
import Task from "../models/task.model.js";

export const syncCalender = async (userId) => {
  const calenderIntegration = await CalenderIntegration.findOne({
    user: userId,
    provider: "google",
  });
  if (!calenderIntegration) return;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: calenderIntegration.accessToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const tasks = await Task.find({ creator: userId });

  for (const task of tasks) {
    const eventDetails = {
      summary: task.title,
      description: task.description || "",
      start: {
        dateTime: task.dueDate.toISOString(),
        timeZone: "UTC", // Adjust based on user's timezone
      },
      end: {
        dateTime: task.dueDate.toISOString(),
        timeZone: "UTC",
      },
    };
    await calendar.events.insert({
      calendarId: "primary",
      resource: eventDetails,
    });
  }
};

// Pull events from Google Calendar
export const syncEventsFromGoogleCalendar = async (userId) => {
  const calendarIntegration = await CalenderIntegration.findOne({
    user: userId,
    provider: "google",
  });

  if (!calendarIntegration) return;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: calendarIntegration.accessToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Fetch events from Google Calendar
  const { data } = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = data.items.map((event) => ({
    title: event.summary,
    dueDate: event.start.dateTime || event.start.date,
  }));

  // Create tasks in ReminderFlow
  for (const event of events) {
    const task = new Task({
      title: event.title,
      dueDate: new Date(event.dueDate),
      creator: userId,
    });
    await task.save();
  }
};
