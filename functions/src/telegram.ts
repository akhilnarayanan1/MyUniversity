/* eslint-disable max-len */
import axios from "axios";
import {UniversityNotifications} from "./types";

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Telegram bot secret
const telegramSecret = functions.config().telegram.botsecret;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const sendMessageToTelegram = (channelName: string, newNotifications: UniversityNotifications, universityName: string) => {
  // eslint-disable-next-line guard-for-in
  for (const tab in newNotifications) {
      newNotifications[tab]?.map((doc) => {
        let notificationMessage = "";
        if (doc?.linkhref) {
          notificationMessage = `<strong>${tab}:</strong>\n\n <code>${doc.notification}</code>\n\n <a href='${doc?.linkhref}'>Click Here To View</a>`;
        } else {
          notificationMessage = `<strong>${tab}:</strong>\n\n <code>${doc.notification}</code>`;
        }
        axios.post(`https://api.telegram.org/bot${telegramSecret}/sendMessage`, {
          chat_id: channelName,
          parse_mode: "HTML",
          text: `${notificationMessage}`,
        }).then(async (response) => {
          if (response.status == 200) {
            await admin.firestore().collection("telegram_updates").add(
                {notification: doc, university: universityName, createdAt: admin.firestore.FieldValue.serverTimestamp()}
            );
          }
        });
      });
  }
};

export {sendMessageToTelegram};