/* eslint-disable max-len */
import * as admin from "firebase-admin";
import * as _ from "lodash";
import {LastDBNotification, UniversityNotifications} from "./types";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getNewNotifications = async (notifications: UniversityNotifications, dbCollection: string) => {
  const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

  const notificationRef = admin.firestore().collection(dbCollection);
  const notification = notificationRef.orderBy("createdAt", "desc").limit(1);

  const querySnapshot = await notification.get();

  const lastDBNotification: LastDBNotification = querySnapshot.docs?.map((doc) => {
    return {id: doc.id, ...doc.data()};
  })[0];

  if (!querySnapshot.empty && _.isEqual(lastDBNotification?.data, notifications)) {
    admin.firestore().collection(dbCollection).doc(lastDBNotification.id || "").update({
      lastUpdatedAt: serverTimestamp,
    });
  } else {
    await admin.firestore().collection(dbCollection).add(
        {data: notifications, createdAt: serverTimestamp, lastUpdatedAt: serverTimestamp}
    );
  }

  const modifiedNotifications: UniversityNotifications = _.omit(notifications, removeKeys(notifications));
  const modifiedLastDBNotification: UniversityNotifications = _.omit(lastDBNotification?.data, removeKeys(lastDBNotification?.data || {}));

  const newNotifications: UniversityNotifications = {};

  _.forEach(notifications, (value, key) => {
    const newNotificationsList = _.differenceWith(modifiedNotifications[key], modifiedLastDBNotification[key], _.isEqual);
    if (!_.isEmpty(newNotificationsList)) newNotifications[key] = newNotificationsList;
  });

  return newNotifications;
};

const removeKeys = (notifications: UniversityNotifications) => {
  let theseKeys: string[] = [];
  _.forEach(notifications, (value, key) => {
    const notificationsArray = [...Array(notifications[key].length)].map((el, i) => {
      return `${key}.${i++}.id`;
    });
    theseKeys = theseKeys.concat(notificationsArray);
  });
  return theseKeys;
};

export {getNewNotifications};
