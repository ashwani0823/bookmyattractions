import { useRouter } from 'next/router'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}


export default function BookingPage({ attraction, booking }) {
  const router = useRouter()

  const travelerCounts = booking.traveler_counts
  const pricing = booking.pricing_snapshot
  const totalAmount = booking.total_amount
  const visitDate = booking.visit_date

  /* Lead traveler info */
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadPhone, setLeadPhone] = useState('')

  /* Payment method */
  const [paymentMethod, setPaymentMethod] = useState('CARD')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /* ===============================
     COMPLETE BOOKING (NO PAYMENT YET)
     =============================== */
  const handleProceedToPayment = async () => {

  setError('')

  if (!leadName || !leadEmail || !leadPhone) {
    setError('Please fill all required details')
    return
  }


  try {
    setLoading(true)

    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking.id,
        leadName,
        leadEmail,
        leadPhone,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Unable to start payment')
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      name: 'BookMyAttractions',
      description: attraction.name,
      handler: function () {
        router.push(`/confirmation/${booking.id}`)
      },
      prefill: {
        name: leadName,
        email: leadEmail,
        contact: leadPhone,
      },
      theme: { color: '#4F46E5' },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()

  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}


  if (!attraction || !visitDate || !travelerCounts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid booking session</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            BookMyAttractions
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT — CHECKOUT FORM */}
        <section className="lg:col-span-2 space-y-6">

          {/* LEAD TRAVELER */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Lead traveler details
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />

              <input
                type="email"
                placeholder="Email address"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />

              <input
                type="tel"
                placeholder="Phone number"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Payment method
            </h2>

            {[
              { key: 'CARD', label: 'Credit / Debit Card' },
              { key: 'UPI', label: 'UPI (Google Pay, PhonePe, Paytm)' },
              { key: 'NETBANKING', label: 'Net Banking' },
            ].map(p => (
              <label key={p.key} className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === p.key}
                  onChange={() => setPaymentMethod(p.key)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>

          {/* COMPLETE BOOKING */}
          <button
            onClick={handleProceedToPayment}
            disabled={loading}
            className={`w-full py-4 rounded-lg font-semibold text-white
                ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}
            `}
            >
            {loading ? 'Processing...' : 'Proceed to payment'}
          </button>


          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}
        </section>

        {/* RIGHT — SUMMARY */}
        <aside className="lg:col-span-1">
          <div className="sticky top-10 bg-white rounded-xl shadow p-6 space-y-4">

            <h3 className="font-semibold text-lg">
              Booking summary
            </h3>

            <div>
              <p className="font-medium">{attraction.name}</p>
              <p className="text-sm text-gray-600">
                {new Date(visitDate).toDateString()}
              </p>
            </div>

            <div className="border-t pt-3 space-y-2 text-sm">
              {pricing.categories.map(cat => {
                const count = travelerCounts[cat.key] || 0
                if (count === 0) return null

                return (
                  <div key={cat.key} className="flex justify-between">
                    <span>{cat.label} × {count}</span>
                    <span>₹{count * cat.price}</span>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>

            <p className="text-xs text-gray-500">
              Taxes included • Free cancellation available
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

/* ===============================
   SERVER SIDE — CREATE PENDING BOOKING
================================ */
export async function getServerSideProps({ params, query }) {
  const { slug } = params
  const { date, pax } = query

  if (!date || !pax) {
    return { notFound: true }
  }

  const travelerCounts = JSON.parse(pax)

  const { data: attraction } = await supabase
    .from('attractions')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!attraction) {
    return { notFound: true }
  }

  const pricing = attraction.pricing

  const totalAmount = pricing.categories.reduce((sum, c) => {
    return sum + (travelerCounts[c.key] || 0) * c.price
  }, 0)

  const { data: booking } = await supabase
    .from('bookings')
    .insert({
      attraction_id: attraction.id,
      visit_date: date,
      traveler_counts: travelerCounts,
      pricing_snapshot: pricing,
      total_amount: totalAmount,
      status: 'PENDING',
    })
    .select()
    .single()

  return {
    props: {
      attraction,
      booking,
    },
  }
}
