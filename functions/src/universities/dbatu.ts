/* eslint-disable max-len */
import cheerio from "cheerio";
import axios, {AxiosResponse} from "axios";

import {EachNotification, UniversityNotifications} from "../types";
import {sendMessageToTelegram} from "../telegram";
import {getNewNotifications} from "../functions";

const universityName = "DBATU";
const telegramChannel = "mydbatu";
const documentNameDBATU = "dbatu_notifications";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const runDBATU = async () => {
  const url = "https://dbatu.ac.in/category/notices/";
  try {
    const response = await axios.get(url);

    const dbatuNotifications: UniversityNotifications = scrapDBATU(response);

    const newNotifications: UniversityNotifications = await getNewNotifications(dbatuNotifications, documentNameDBATU);

    sendMessageToTelegram(telegramChannel, newNotifications, universityName);

    return [200, dbatuNotifications];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return [400, e.message];
  }
};


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const scrapDBATU = (response: AxiosResponse) => {
  const $ = cheerio.load(response.data);
  const downloadable = [".pdf", ".xlsx", ".xls"];
  const domainpresent = ["https://", "http://"];
  const dbatuNotifications: UniversityNotifications = {};

  const nofiticationsArray: EachNotification[] = [];
  $("main#main article").each((i, notification) => {
    const eachNotification: EachNotification = {};
    eachNotification["id"] = i+1;
    const eachNotificationObj = $(notification).find(".entry-header .entry-title a");
    eachNotification["linkhref"] = eachNotificationObj[0].attribs.href;
    eachNotification["notification"] = eachNotificationObj.text();

    eachNotification["visit_or_download"] = "visit";

    downloadable.map(function(value) {
      if (eachNotificationObj[0].attribs.href.includes(value)) {
        eachNotification["visit_or_download"] = "download";
      }
    });

    domainpresent.map(function(value) {
      if (eachNotificationObj[0].attribs.href.includes(value)) {
        eachNotification["linkhref"] = eachNotificationObj[0].attribs.href;
      }
    });

    nofiticationsArray.push(eachNotification);
  });
  dbatuNotifications["Student's Board"] = nofiticationsArray;
  return dbatuNotifications;
};


export {runDBATU, scrapDBATU, documentNameDBATU};
