import crypto from 'crypto'
import { supabase } from '../../../lib/supabaseClient'

export const config = {
  api: {
    bodyParser: false, // 🔒 required for signature verification
  },
}

export default async function handler(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET

  const rawBody = await getRawBody(req)
  const signature = req.headers['x-razorpay-signature']

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  if (expectedSignature !== signature) {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const event = JSON.parse(rawBody)

  // ✅ PAYMENT SUCCESS
  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity

    await supabase
      .from('bookings')
      .update({
        status: 'CONFIRMED',
        razorpay_payment_id: payment.id,
        paid_at: new Date(payment.created_at * 1000),
      })
      .eq('razorpay_order_id', payment.order_id)
  }

  res.json({ received: true })
}

// Helper to read raw body
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}
