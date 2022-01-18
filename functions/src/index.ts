/* eslint-disable max-len */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

import * as express from "express";
const app = express();

import {LastDBNotification, LastDBNotificationOptional, UniversityNotifications} from "./types";
import {runRGPV} from "./universities/rgpv";


app.get("/:universityname", async (req, res) => {
  try {
    switch (req.params.universityname) {
      case "rgpv": {
        let rgpvNotifications: UniversityNotifications | LastDBNotificationOptional = {};
        const notificationRef = admin.firestore().collection("rgpv_notifications");
        const notification = notificationRef.orderBy("createdAt", "desc").limit(1);

        const querySnapshot = await notification.get();
        const lastDBNotification: LastDBNotification | LastDBNotificationOptional = querySnapshot.docs?.map((doc) => {
          return {id: doc.id, ...doc.data()};
        })[0];
        rgpvNotifications = lastDBNotification;

        return res.status(200).json(rgpvNotifications);
      }
      default:
        return res.status(400).json({"message": "Invalid University Name"});
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return res.status(400).json({"message": e.message});
  }
});


// app.get("/live/:universityname", async (req, res) => {
//   switch (req.params.universityname) {
//     case "rgpv":
//       // eslint-disable-next-line no-case-declarations
//       const [statusCode, rgpvNotifications] = await runRGPV();
//       return res.status(statusCode).json({"data": rgpvNotifications});
//     default:
//       return res.status(400).json({"message": "Invalid University Name"});
//   }
// });

exports.api = functions.https.onRequest(app);
exports.api_scheduled = functions.pubsub.schedule("30 */1 * * *")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .onRun(async (context) => {
      await runRGPV();
      return null;
    });


