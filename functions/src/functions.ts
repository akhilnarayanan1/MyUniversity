/* eslint-disable max-len */
import * as admin from "firebase-admin";
import * as _ from "lodash";
import {LastDBNotification, UniversityNotifications} from "./types";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getNewNotifications = async (notifications: UniversityNotifications, dbCollection: string) => {
  const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

  const {lastDBNotification, querySnapshot} = await getLastDBNotification(dbCollection);

  if (!querySnapshot.empty && _.isEqual(lastDBNotification?.data, notifications)) {
    admin.firestore().collection(dbCollection).doc(lastDBNotification.id || "").update({
      lastUpdatedAt: serverTimestamp,
    });
  } else {
    await admin.firestore().collection(dbCollection).add(
        {data: notifications, createdAt: serverTimestamp, lastUpdatedAt: serverTimestamp}
    );
  }

  const modifiedNotifications: UniversityNotifications = _.pick(notifications, pickKeys(notifications));
  const modifiedLastDBNotification: UniversityNotifications = _.pick(lastDBNotification?.data || {}, pickKeys(lastDBNotification?.data || {}));

  const newNotifications: UniversityNotifications = {};

  _.forEach(notifications, (value, key) => {
    const newNotificationsList = _.differenceWith(modifiedNotifications[key], modifiedLastDBNotification[key], _.isEqual);
    if (!_.isEmpty(newNotificationsList)) newNotifications[key] = newNotificationsList;
  });

  return newNotifications;
};

const pickKeys = (notifications: UniversityNotifications) => {
  let theseKeys: string[] = [];
  _.forEach(notifications, (value, key) => {
    const notificationsArray = [...Array(notifications[key].length)].map((el, i) => {
      const notificationPath = `${key}.${i}.notification`;
      const urlPath = `${key}.${i}.linkhref`;
      i++;
      return [notificationPath, urlPath];
    });
    theseKeys = theseKeys.concat(...notificationsArray);
  });
  return theseKeys;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getLastDBNotification = async (dbCollection: string) => {
  const notificationRef = admin.firestore().collection(dbCollection);
  const notification = notificationRef.orderBy("createdAt", "desc").limit(1);

  const querySnapshot = await notification.get();
  const lastDBNotification: LastDBNotification = querySnapshot.docs?.map((doc) => {
    return {id: doc.id, ...doc.data()};
  })[0];

  return {lastDBNotification, querySnapshot};
};

export {getNewNotifications, getLastDBNotification};
