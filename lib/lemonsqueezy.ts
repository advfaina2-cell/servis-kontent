import crypto from 'crypto'

export function getCheckoutUrl(email: string): string {
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID!
  const params = new URLSearchParams({
    'checkout[email]': email,
    'checkout[custom][user_email]': email,
  })
  return `https://voicepost.lemonsqueezy.com/buy/${variantId}?${params}`
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')

  const digestBuffer = Buffer.from(digest, 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')

  // timingSafeEqual throws if buffer lengths differ — a malformed/forged
  // signature header would otherwise crash the route with a 500 instead of
  // cleanly failing verification.
  if (digestBuffer.length !== signatureBuffer.length) return false

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer)
}
