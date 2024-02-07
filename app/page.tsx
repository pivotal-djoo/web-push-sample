'use client';

import { ThemeProvider } from '@emotion/react';
import Head from 'next/head';
import { theme } from './theme';
import { Button, Typography } from '@mui/material';
import {
  checkSubscription,
  register,
  requestPermission,
  testNotification,
  unregister,
} from './notifications';
import { useEffect, useState } from 'react';

export default function Home() {
  const [serviceWorkerAvailable, setServiceWorkerAvailable] = useState(true);
  const [pushManagerAvailable, setPushManagerAvailable] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState('Unknown');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    checkStatuses();
  }, []);

  function checkStatuses() {
    requestPermission().then((result) => {
      setNotificationPermission(result);
      setServiceWorkerAvailable('serviceWorker' in navigator);
      setPushManagerAvailable('PushManager' in window);
    });
    checkSubscription().then((result) => setSubscribed(!!result));
  }

  return (
    <>
      <Head>
        <title>Web Push Sample</title>
        <meta
          name="description"
          content="Sample project to test web push notification."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <ThemeProvider theme={theme}>
        <main>
          <Typography variant="h5" style={{ margin: '2rem' }}>
            Test push notifications!
          </Typography>

          <Typography variant="h6" style={{ margin: '2rem' }}>
            Notification permission status: {notificationPermission}
          </Typography>

          <Typography variant="h6" style={{ margin: '2rem' }}>
            {serviceWorkerAvailable
              ? 'Service Worker Available 🟢'
              : 'Service Worker is not supported on this browser. 🔴'}
          </Typography>

          <Typography variant="h6" style={{ margin: '2rem' }}>
            {pushManagerAvailable
              ? 'Push Manager Available 🟢'
              : 'Push is not supported on this browser. 🔴'}
          </Typography>

          {!(serviceWorkerAvailable && pushManagerAvailable) && (
            <Typography variant="body1" style={{ margin: '2rem' }}>
              ({typeof navigator !== 'undefined' && navigator?.userAgent})
            </Typography>
          )}

          {typeof window !== 'undefined' &&
            (!!navigator?.userAgent.match(/iPad/i) ||
              !!navigator?.userAgent.match(/iPhone/i)) &&
            !('standalone' in window?.navigator) && (
              <Typography variant="body1" style={{ margin: '2rem' }}>
                Add this webpage to your home screen.
              </Typography>
            )}

          {serviceWorkerAvailable && pushManagerAvailable && (
            <>
              <Typography variant="h6" style={{ margin: '2rem' }}>
                Subscription status:
                {subscribed ? ' Subscribed 🟢' : ' Not subscribed 🔴'}
              </Typography>
              <Button
                variant="contained"
                style={{ margin: '2rem' }}
                onClick={async () => {
                  await register();
                  checkStatuses();
                }}
              >
                Register
              </Button>

              <Button
                variant="contained"
                style={{ margin: '2rem' }}
                disabled={!subscribed}
                onClick={async () => {
                  await testNotification();
                  checkStatuses();
                }}
              >
                Test
              </Button>

              {subscribed && (
                <Button
                  variant="contained"
                  style={{ margin: '2rem' }}
                  onClick={async () => {
                    await unregister();
                    checkStatuses();
                  }}
                >
                  Unregister
                </Button>
              )}
            </>
          )}
        </main>
      </ThemeProvider>
    </>
  );
}
