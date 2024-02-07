import { v4 as uuidv4 } from 'uuid';
import webPush from 'web-push';

export type PushSubscriptionsRecords = {
  [key: string]: webPush.PushSubscription;
};

export function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem('userId', userId);
  }
  return userId;
}
