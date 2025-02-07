import Twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSms = async (to, message) => {
  try {
    const response = await client.message.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`SMS send to ${to}:`, response.sid);
  } catch (error) {
    console.log("Error sending Sms", error.message);
    throw error;
  }
};
