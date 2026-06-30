import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWebhookSignature } from '@/lib/lemonsqueezy'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature') ?? ''
  const payload = await request.text()

  if (!verifyWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(payload)
  const eventName = event.meta?.event_name

  if (eventName === 'order_created') {
    const userEmail = event.meta?.custom_data?.user_email
    const customerId = String(event.data?.attributes?.customer_id ?? '')

    if (!userEmail) return NextResponse.json({ ok: true })

    const { data: profile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single()

    if (selectError) {
      console.error('Failed to look up profile for order_created webhook:', selectError)
    }

    if (profile) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_subscribed: true, ls_customer_id: customerId })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Failed to activate subscription for profile:', profile.id, updateError)
      }
    }
  }

  if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
    const userEmail = event.meta?.custom_data?.user_email
    if (userEmail) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_subscribed: false })
        .eq('email', userEmail)

      if (updateError) {
        console.error('Failed to deactivate subscription for email:', userEmail, updateError)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
