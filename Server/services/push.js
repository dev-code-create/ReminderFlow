import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  ),
});

export const sendPushNotification = async (token, title, body) => {
  const message = {
    token,
    notification: { title, body },
  };

  await admin.messaging().send(message);
};
