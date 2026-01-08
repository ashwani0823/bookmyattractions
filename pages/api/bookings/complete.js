import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bookingId, leadName, leadEmail, leadPhone } = req.body

  if (!bookingId || !leadName || !leadEmail || !leadPhone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { error } = await supabase
    .from('bookings')
    .update({
      lead_name: leadName,
      lead_email: leadEmail,
      lead_phone: leadPhone,
    })
    .eq('id', bookingId)

  if (error) {
    console.error('Booking update failed:', error)
    return res.status(500).json({ error: 'Failed to update booking' })
  }

  return res.status(200).json({ success: true })
}
