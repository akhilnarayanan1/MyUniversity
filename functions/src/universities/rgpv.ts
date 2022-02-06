/* eslint-disable max-len */
import cheerio from "cheerio";
import axios, {AxiosResponse} from "axios";

import * as _ from "lodash";
import * as admin from "firebase-admin";

import {LastDBNotification, LastDBNotificationOptional, EachNotification, UniversityNotifications} from "../types";
import {sendMessageToTelegram} from "../telegram";

const universityName = "RGPV";
const telegramChannel = "@myrgpv";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const runRGPV = async () => {
  const url = "https://www.rgpv.ac.in/";
  try {
    const response = await axios.get(url);

    const rgpvNotifications: UniversityNotifications = scrapRGPV(response, url);

    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    const notificationRef = admin.firestore().collection("rgpv_notifications");
    const notification = notificationRef.orderBy("createdAt", "desc").limit(1);

    const querySnapshot = await notification.get();

    const lastDBNotification: LastDBNotification | LastDBNotificationOptional = querySnapshot.docs?.map((doc) => {
      return {id: doc.id, ...doc.data()};
    })[0];

    if (!querySnapshot.empty && _.isEqual(lastDBNotification?.data, rgpvNotifications)) {
      admin.firestore().collection("rgpv_notifications").doc(lastDBNotification.id || "").update({
        lastUpdatedAt: serverTimestamp,
      });
    } else {
      await admin.firestore().collection("rgpv_notifications").add(
          {data: rgpvNotifications, createdAt: serverTimestamp, lastUpdatedAt: serverTimestamp}
      );
    }

    const removeKeys = (notifications: UniversityNotifications) => {
      let theseKeys: string[] = [];
      _.forEach(notifications, (value, key) => {
        const notificationsArray = [...Array(rgpvNotifications[key].length)].map((el, i) => {
          return `${key}.${i++}.id`;
        });
        theseKeys = theseKeys.concat(notificationsArray);
      });
      return theseKeys;
    };

    const modifiedRgpvNotifications = _.omit(rgpvNotifications, removeKeys(rgpvNotifications));
    const modifiedLastDBNotification = _.omit(lastDBNotification.data, removeKeys(lastDBNotification?.data || {}));

    const newNotifications: UniversityNotifications = {};

    _.forEach(rgpvNotifications, (value, key) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      const newNotificationsList = _.differenceWith(modifiedRgpvNotifications[key], modifiedLastDBNotification[key], _.isEqual);
      if (!_.isEmpty(newNotificationsList)) newNotifications[key] = newNotificationsList;
    });

    sendMessageToTelegram(telegramChannel, newNotifications, universityName);

    return [200, rgpvNotifications];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return [400, e.message];
  }
};


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const scrapRGPV = (response: AxiosResponse, url: string) => {
  const $ = cheerio.load(response.data);
  const downloadable = [".pdf", ".xlsx", ".xls"];
  const domainpresent = ["https://", "http://"];
  const rgpvNotifications: UniversityNotifications = {};
  $("div div.tab-content").find("div.tab-pane").each((i, el) => {
    // eslint-disable-next-line prefer-const
    let nofiticationsArray: EachNotification[] = [];
    $(el.children).each((i, notification) => {
      // eslint-disable-next-line prefer-const
      let eachNotification: EachNotification = {};
      eachNotification["id"] = i+1;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      $(notification.children).each((i, content) => {
        if (content.type=="text" && content.data.length>1) {
          eachNotification["notification"] = content.data;
        }
        if (content.type==="tag" && content.name==="img") {
          eachNotification["new_img"] = url+content.attribs.src;
          domainpresent.map((value) => {
            if (content.attribs.src.includes(value)) {
              eachNotification["new_img"] = content.attribs.src;
            }
          });
        }
        if (content.type==="tag" && content.name==="a") {
          eachNotification["visit_or_download"] = "visit";
          eachNotification["linkhref"] = url+content.attribs.href;
          downloadable.map(function(value) {
            if (content.attribs.href.includes(value)) {
              eachNotification["visit_or_download"] = "download";
            }
          });
          domainpresent.map(function(value) {
            if (content.attribs.href.includes(value)) {
              eachNotification["linkhref"] = content.attribs.href;
            }
          });
        }
      });
      nofiticationsArray.push(eachNotification);
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    rgpvNotifications[$(el.parent.parent).find("ul.nav-tabs li a[data-toggle='tab']")[i].children[0].data] = nofiticationsArray;
  });
  return rgpvNotifications;
};

export {runRGPV, scrapRGPV};
