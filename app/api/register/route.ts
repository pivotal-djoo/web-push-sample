import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { kv } from '@vercel/kv';
import { PushSubscriptionsRecords as PushSubcriptionsRecords } from '@/app/models';

const vapidKeys = {
  publicKey:
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  privateKey: 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls',
};

webPush.setVapidDetails(
  'mailto:web-push-book@gauntface.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = req.headers.get('userid');
  if (!userId) {
    return NextResponse.json({
      status: 400,
      message: 'userid header not provided.',
    });
  }

  const pushSubscription = await req.json();

  await saveSubscription(userId, pushSubscription);

  const message = 'Registered to push notifications!';
  return webPush
    .sendNotification(pushSubscription, message)
    .then((result) => {
      return NextResponse.json(result);
    })
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 410) {
        const error = `Subscription has expired or is no longer valid: ${err}`;
        console.error(error);
        return NextResponse.json({ status: 400, message: error });
      } else {
        return NextResponse.json({
          status: 400,
          message: 'Unexpected error',
          error: err,
        });
      }
    });
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get('userid');
  if (!userId) {
    return NextResponse.json({
      status: 400,
      message: 'userid header not provided.',
    });
  }

  const pushSubscription = await removeSubscription(userId);
  console.log('# unsubscribing from ', pushSubscription);
  if (
    pushSubscription &&
    'unsubscribe' in pushSubscription &&
    typeof pushSubscription.unsubscribe === 'function'
  ) {
    console.log('# unsubscribe is a function in ', pushSubscription);
    await pushSubscription.unsubscribe();
    return NextResponse.json({ status: 200 });
  }

  return NextResponse.json({
    status: 404,
    message: `could not find subscription for userid: ${userId}`,
  });
}

async function saveSubscription(
  userId: string,
  pushSubscription: PushSubscription
) {
  try {
    const savedPushNotifications =
      (await kv.get<PushSubcriptionsRecords>('pushSubscriptions')) || {};

    console.log(
      '# of saved subscriptions: ',
      Object.keys(savedPushNotifications).length
    );
    const updatedPushSubscriptions = {
      ...savedPushNotifications,
      [userId]: pushSubscription,
    };
    const updatedPushSubscriptionsString = updatedPushSubscriptions;
    console.log(
      '# updatedPushSubscriptionsString: ',
      updatedPushSubscriptionsString
    );
    await kv.set('pushSubscriptions', updatedPushSubscriptionsString);
  } catch (error) {
    console.error('Unable to save push subscription', error);
  }
}

async function removeSubscription(userId: string) {
  let pushSubscription = undefined;
  try {
    let savedPushSubscriptions =
      (await kv.get<PushSubcriptionsRecords>('pushSubscriptions')) || {};
    console.log(
      '# of saved subscriptions: ',
      Object.keys(savedPushSubscriptions).length
    );
    pushSubscription = savedPushSubscriptions[userId];
    delete savedPushSubscriptions[userId];
    await kv.set('pushSubscriptions', savedPushSubscriptions);
  } catch (error) {
    console.error('Unable to remove push subscription.');
  }
  return pushSubscription;
}
