import { prisma } from '@/lib/prisma'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidEmail = process.env.VAPID_EMAIL || 'admin@wordcrammer.app'

export { vapidPublicKey, vapidPrivateKey, vapidEmail }

export async function sendPushNotification(username: string, title: string, body: string, url = '/') {
  const webpush = await import('web-push')
  webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey)

  const subs = await prisma.tblPushSubscriptions.findMany({ where: { username } })

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url }),
      )
    } catch (e) {
      // Subscription expired — remove it
      if (e instanceof Error && e.message.includes('410')) {
        await prisma.tblPushSubscriptions.delete({ where: { id: sub.id } })
      }
    }
  }

  return subs.length
}
