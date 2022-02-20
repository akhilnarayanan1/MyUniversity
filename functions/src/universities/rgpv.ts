/* eslint-disable max-len */
import cheerio from "cheerio";
import axios, {AxiosResponse} from "axios";

import {EachNotification, UniversityNotifications} from "../types";
import {sendMessageToTelegram} from "../telegram";
import {getNewNotifications} from "../functions";

const universityName = "RGPV";
const telegramChannel = "@myrgpv";
const documentNameRGPV = "rgpv_notifications";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const runRGPV = async () => {
  const url = "https://www.rgpv.ac.in/";
  try {
    const response = await axios.get(url);

    const rgpvNotifications: UniversityNotifications = scrapRGPV(response, url);

    const newNotifications: UniversityNotifications = await getNewNotifications(rgpvNotifications, documentNameRGPV);

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
    const nofiticationsArray: EachNotification[] = [];
    $(el.children).each((i, notification) => {
      const eachNotification: EachNotification = {};
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

export {runRGPV, scrapRGPV, documentNameRGPV};
