import Razorpay from 'razorpay'
import { supabase } from '../../../lib/supabaseClient'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { bookingId } = req.body

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID required' })
    }

    // Fetch booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }


    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: booking.total_amount * 100, // paise
      currency: 'INR',
      receipt: booking.id,
    })

    // Save order id
    await supabase
      .from('bookings')
      .update({
        razorpay_order_id: order.id,
      })
      .eq('id', booking.id)

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.id,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Payment order failed' })
  }
}
