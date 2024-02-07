'use client';

import { getUserId } from './models';

const applicationServerKey =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

const subscribeOptions = {
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
};

export async function register() {
  const registration = await getServiceWorkerRegistration();

  let pushSubscription = await getSubscription(registration);

  if (!pushSubscription) {
    pushSubscription = await registration.pushManager
      .subscribe(subscribeOptions)
      .catch((err) => {
        console.error('Unable to subscribe to pushManager,', err);
      });
    console.log('#### Push Subscription: ', pushSubscription);
  }

  if (pushSubscription) {
    saveSubscription(pushSubscription);
  }
}

export async function unregister() {
  const subscription = await checkSubscription();
  await subscription?.unsubscribe();

  return fetch('/api/register', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      userid: getUserId(),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }
      return response.json();
    })
    .then((responseData) => {
      console.log(responseData);
    });
}

export async function checkSubscription() {
  const registration = await getServiceWorkerRegistration();
  return getSubscription(registration);
}

export async function requestPermission() {
  if (Notification.permission !== 'granted') {
    return Notification.requestPermission()
      .then((result) => {
        if (result !== 'granted') {
          console.error('Notification permission not granted,', result);
        } else {
          console.log('Notification permission: ', result);
        }
        return result;
      })
      .catch((err) => {
        console.error(
          'Unable to retrieve notification permission information,',
          err
        );
        return 'Error';
      });
  } else {
    return Notification.permission;
  }
}

export async function testNotification() {
  const registration = await getServiceWorkerRegistration();
  const pushSubscription = await getSubscription(registration);

  return fetch('/api/test', {
    method: 'POST',
    body: JSON.stringify(pushSubscription),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }
      return response.json();
    })
    .then(function (responseData) {
      console.log(responseData);
      return responseData;
    });
}

async function getSubscription(registration: ServiceWorkerRegistration) {
  const pushSubscription = await registration.pushManager
    .getSubscription()
    .catch((err) => {
      console.error('Unable to retrieve subscription,', err);
    });
  console.log('##### pushManager.getSubscription(): ', pushSubscription);

  return pushSubscription;
}

async function getServiceWorkerRegistration() {
  let registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.error('Unable to register service worker,', err);
    });
    registration = await navigator.serviceWorker.ready;
  }

  console.log('##### serviceWorker registration: ', registration);

  return registration;
}

function saveSubscription(subscription: PushSubscription) {
  return fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      userid: getUserId(),
    },
    body: JSON.stringify(subscription),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }
      return response.json();
    })
    .then((responseData) => {
      console.log(responseData);
    });
}

function urlBase64ToUint8Array(base64String: string) {
  if (typeof window === 'undefined') {
    return new Uint8Array();
  }

  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
