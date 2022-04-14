/* eslint-disable max-len */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

import * as express from "express";
const app = express();

import {LastDBNotification, UniversityNotifications} from "./types";
import {runRGPV, documentNameRGPV} from "./universities/rgpv";
import {runDBATU, documentNameDBATU} from "./universities/dbatu";
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
      case "dbatu": {
        let dbatuNotifications: UniversityNotifications | LastDBNotification = {};
        const {lastDBNotification} = await getLastDBNotification(documentNameDBATU);
        dbatuNotifications = lastDBNotification;

        return res.status(200).json(dbatuNotifications);
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
//       const [statusCodeRGPV, rgpvNotifications] = await runRGPV();
//       return res.status(statusCodeRGPV).json({"data": rgpvNotifications});
//     case "dbatu":
//       // eslint-disable-next-line no-case-declarations
//       const [statusCodeDBATU, dbatuNotifications] = await runDBATU();
//       return res.status(statusCodeDBATU).json({"data": dbatuNotifications});
//     default:
//       return res.status(400).json({"message": "Invalid University Name"});
//   }
// });

exports.api = functions.https.onRequest(app);
exports.api_scheduled_rgpv = functions.pubsub.schedule("30 */2 * * *")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .onRun(async (context) => {
      await runRGPV();
      return null;
    });

exports.api_scheduled_dbatu = functions.pubsub.schedule("30 */2 * * *")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .onRun(async (context) => {
      await runDBATU();
      return null;
    });


