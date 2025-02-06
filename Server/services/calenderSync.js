import { google } from "googleapis";
import CalenderIntegration from "../models/calenderIntergration.model";

export const syncCalender = async (userId) => {
  const calenderIntegration = await CalenderIntegration.findOne({
    user: userId,
    provider: "google",
  });
  if (!calenderIntegration) return;

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: calenderIntegration });

  const calender = google.calender({ version: "v3", auth: oauth2Client });

  const { data } = await calender.events.list({
    calenderId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = data.items.map((events) => ({
    title: events.summary,
    start: events.start.dateTime || events.start.date,
    end: events.end.dateTime || events.end.date,
  }));
  console.log("Synced events:", events);
};
