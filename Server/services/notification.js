import User from "../models/user.model";
import { sendEmail } from "./email";
import { sendPushNotification } from "./push";
import { sendSms } from "./twilio";

export const sendNotification = async (user, reminder) => {
  const { notificationPreferences } = User;

  if (notificationPreferences.sms && user.phoneNumber) {
    await sendSms(user.phoneNumber, reminder.message);
  }

  if (notificationPreferences.email && user.email) {
    await sendEmail(user.email, reminder.title, reminder.message);
  }

  if (notificationPreferences.push && user.pushToken) {
    await sendPushNotification(
      user.pushToken,
      reminder.title,
      reminder.message
    );
  }
};
