import { supabase } from '../../../lib/supabaseClient'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { bookingId } = req.body
  if (!bookingId) return res.status(400).json({ error: 'Booking ID required' })

  // Fetch booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, attractions(name, city, state)')
    .eq('id', bookingId)
    .single()

  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  const { lead_name, lead_email, lead_phone, total_amount, visit_date, attractions } = booking

  // Generate QR Code (confirmation link encoded)
  const qrData = await QRCode.toDataURL(`${process.env.NEXT_PUBLIC_SITE_URL}/confirmation/${booking.id}`)

  /* ==== SEND EMAIL ==== */
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: `"BookMyAttractions" <${process.env.EMAIL_USER}>`,
    to: lead_email,
    subject: `Booking Confirmed – ${attractions.name}`,
    html: `
      <h2>Your booking is confirmed!</h2>
      <p><strong>Activity:</strong> ${attractions.name}</p>
      <p><strong>Location:</strong> ${attractions.city}, ${attractions.state}</p>
      <p><strong>Date of visit:</strong> ${new Date(visit_date).toDateString()}</p>
      <p><strong>Travelers:</strong> ${JSON.stringify(booking.traveler_counts)}</p>
      <p><strong>Total paid:</strong> ₹${total_amount}</p>
      <br/>
      <p>Show this QR code at the attraction:</p>
      <img src="${qrData}" alt="QR Code" style="width:180px;border-radius:12px"/>
      <br/><br/>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/confirmation/${booking.id}"
         style="background:#4F46E5;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
         View Booking
      </a>
    `,
  }

  await transporter.sendMail(mailOptions)

  /* ==== SEND SMS (via your preferred provider later, for now demo log) ==== */
  console.log(`SMS TO: ${lead_phone}`)
  console.log(`Message: Your booking for ${attractions.name} on ${new Date(visit_date).toDateString()} is confirmed. Show QR sent on email.`)

  return res.status(200).json({ success: true, qr: qrData })
}
