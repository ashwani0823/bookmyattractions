import { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function ConfirmationPage({ booking }) {
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking not found</p>
      </div>
    )
  }

  // ⏳ Payment received, waiting for webhook update
  if (booking.status === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow p-8 text-center max-w-md">
          <h1 className="text-xl font-semibold">Confirming your booking…</h1>
          <p className="text-gray-600 mt-3">
            We’ve received your payment. Please wait while we confirm your booking.
          </p>
          <p className="text-sm text-gray-500 mt-4">This usually takes a few seconds.</p>
          <p className="text-xs text-gray-400 mt-6">This page will refresh automatically.</p>
        </div>
      </div>
    )
  }

  // ✅ Booking CONFIRMED by webhook
  if (booking.status === 'CONFIRMED') {
    // 🔔 Trigger SMS + Email confirmation (runs once)
    useEffect(() => {
      fetch('/api/bookings/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      }).catch(console.error)
    }, [])

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="bg-white rounded-xl shadow p-8">
            <h1 className="text-2xl font-bold text-green-600">Booking Confirmed 🎉</h1>
            <p className="mt-4 text-gray-700">Your payment was successful and your booking is confirmed.</p>

            <div className="mt-6 text-left space-y-3">
              <p><strong>Booking ID:</strong> {booking.id}</p>
              <p><strong>Attraction:</strong> {booking.attraction_name}</p>
              <p><strong>Visit date:</strong> {new Date(booking.visit_date).toDateString()}</p>
              <p><strong>Total paid:</strong> ₹{booking.total_amount}</p>

              {/* Lead Traveler Details */}
              {booking.lead_name && (
                <>
                  <p><strong>Name:</strong> {booking.lead_name}</p>
                  <p><strong>Email:</strong> {booking.lead_email}</p>
                  <p><strong>Phone:</strong> {booking.lead_phone}</p>
                </>
              )}
            </div>

            {/* 🎟 ENTRY QR CODE */}
            <div className="mt-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-3">Your Entry QR Code</h3>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.id}`}
                alt="Entry QR"
                className="w-40 border rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-2">Show this at the attraction to enter</p>
            </div>

            {/* NAVIGATION */}
            <div className="mt-8">
              <Link
                href="/"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ❌ Failed or unknown state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Something went wrong. Please contact support.</p>
    </div>
  )
}

/* ===============================
   SERVER SIDE — Retrieve booking updated by webhook
================================ */
export async function getServerSideProps({ params }) {
  const { bookingId } = params

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id,
      visit_date,
      total_amount,
      status,
      lead_name,
      lead_email,
      lead_phone,
      attractions ( name )
    `)
    .eq('id', bookingId)
    .eq('status', 'CONFIRMED')
    .single()

  if (!booking) {
    return { notFound: true }
  }

  return {
    props: {
      booking: {
        id: booking.id,
        visit_date: booking.visit_date,
        total_amount: booking.total_amount,
        status: booking.status,
        lead_name: booking.lead_name,
        lead_email: booking.lead_email,
        lead_phone: booking.lead_phone,
        attraction_name: booking.attractions.name,
      },
    },
  }
}
