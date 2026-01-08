import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function PaymentPage() {
  const router = useRouter()
  const { bookingId } = router.query

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) return

    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          attraction:attractions(name, city)
        `)
        .eq('id', bookingId)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setBooking(data)
      setLoading(false)
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payment…
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Booking not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <p className="font-semibold">{booking.attraction.name}</p>
          <p className="text-sm text-gray-600">
            {booking.attraction.city}
          </p>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">Total amount</p>
            <p className="text-2xl font-bold">₹{booking.total_price}</p>
          </div>

          <button
            onClick={() => alert('Payment gateway comes next')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
          >
            Pay now
          </button>

          <p className="text-xs text-gray-500">
            Secure payment • SSL encrypted
          </p>
        </div>
      </div>
    </div>
  )
}
