import cron from "node-cron";
import User from "../models/user.model";
import { syncCalender } from "./calenderSync";

// Schedule a daily cron job at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    // Find all users with calendar sync enabled
    const users = await User.find({ "calendarIntegration.syncEnabled": true });

    // Sync calendar events for each user
    for (const user of users) {
      await syncCalender(user._id);
    }

    console.log("Cron job completed successfully.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
