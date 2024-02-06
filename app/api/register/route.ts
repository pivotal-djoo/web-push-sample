import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';

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
  const pushSubscription = await req.json();
  const message = 'Test push notification!';
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
