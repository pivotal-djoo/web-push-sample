import { NextRequest, NextResponse } from 'next/server';
import webPush, { WebPushError } from 'web-push';
import { kv } from '@vercel/kv';
import { PushSubscriptionsRecords } from '@/app/models';

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
  let allPushSubscriptions = await getAllSubscriptions();
  if (allPushSubscriptions.length === 0) {
    const currentPushSubcription = await req.json();
    allPushSubscriptions = [currentPushSubcription];
  }

  try {
    allPushSubscriptions.map(async (pushSubscription) => {
      return await webPush.sendNotification(
        pushSubscription,
        'Test push notification!'
      );
    });
  } catch (err) {
    if (err instanceof WebPushError) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        const error = `Subscription has expired or is no longer valid: ${err}`;
        console.error(error);
        return NextResponse.json({ status: 400, message: error });
      }
    }
    return NextResponse.json({
      status: 400,
      message: 'Unexpected error',
      error: err,
    });
  }
  return NextResponse.json({ status: 200 });
}

async function getAllSubscriptions(): Promise<webPush.PushSubscription[]> {
  let allPushSubscriptions: webPush.PushSubscription[] = [];
  try {
    const savedPushSubscriptions =
      (await kv.get<PushSubscriptionsRecords>('pushSubscriptions')) || {};
    console.log(
      '# of saved subscriptions: ',
      Object.keys(savedPushSubscriptions).length
    );
    allPushSubscriptions = Object.values<webPush.PushSubscription>(
      savedPushSubscriptions
    );
    console.log('# of saved subscriptions: ', allPushSubscriptions.length);
  } catch (error) {
    console.error('Unable to get all push subscription.');
  }
  return allPushSubscriptions;
}
