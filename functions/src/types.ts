import * as admin from "firebase-admin";

interface LastDBNotification {
    id?: string,
    createdAt?: admin.firestore.Timestamp,
    lastUpdatedAt?: admin.firestore.Timestamp,
    data?: UniversityNotifications
}

interface UniversityNotifications {
    [key: string]: EachNotification[]
}

interface EachNotification {
  id?: number,
  notification?: string,
  // eslint-disable-next-line camelcase
  new_img?: string,
  // eslint-disable-next-line camelcase
  visit_or_download?: string,
  linkhref?: string
}

// eslint-disable-next-line max-len
export {LastDBNotification, UniversityNotifications, EachNotification};
