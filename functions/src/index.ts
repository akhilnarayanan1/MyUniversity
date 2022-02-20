/* eslint-disable max-len */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

import * as express from "express";
const app = express();

import {LastDBNotification, UniversityNotifications} from "./types";
import {runRGPV, documentNameRGPV} from "./universities/rgpv";
import {getLastDBNotification} from "./functions";


app.get("/:universityname", async (req, res) => {
  try {
    switch (req.params.universityname) {
      case "rgpv": {
        let rgpvNotifications: UniversityNotifications | LastDBNotification = {};
        const {lastDBNotification} = await getLastDBNotification(documentNameRGPV);
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
exports.api_scheduled = functions.pubsub.schedule("30 */3 * * *")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .onRun(async (context) => {
      await runRGPV();
      return null;
    });


