import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import SearchBar from '../../components/SearchBar'



/* ===============================
   AUTOCOMPLETE
================================ */
const getSuggestions = (data, query) => {
  if (!query || query.length < 2) return []

  const q = query.toLowerCase()
  const seenCities = new Set()
  const results = []

  data.forEach(a => {
    if (a.city && a.city.toLowerCase().includes(q) && !seenCities.has(a.city)) {
      seenCities.add(a.city)
      results.push({ type: 'city', value: a.city })
    }

    if (a.name && a.name.toLowerCase().includes(q)) {
      results.push({ type: 'attraction', value: a.name })
    }
  })

  return results.slice(0, 8)
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]


/* ===============================
   PAGE
================================ */
export default function AttractionDetailsPage({
  attraction,
  suggestionsData,
}) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState('')
  const [showTravelers, setShowTravelers] = useState(false)


  const handleReserveNow = () => {
    if (!selectedDate || isClosedDate) return

    router.push({
      pathname: `/booking/${attraction.slug}`,
      query: {
        date: selectedDate,
        pax: JSON.stringify(travelerCounts),
      },
    })
  }

  if (!attraction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Attraction not found</p>
      </div>
    )
  }

  /* ===============================
   PRICING LOGIC (INDIAN ONLY)
================================ */
const pricing = attraction.pricing

const [travelerCounts, setTravelerCounts] = useState(() => {
  const initial = {}
  pricing?.categories?.forEach(c => {
    initial[c.key] = c.key === 'ADULT' ? 1 : 0 // default 1 adult
  })
  return initial
})

const totalPrice = useMemo(() => {
  if (!pricing) return 0
  return pricing.categories.reduce((sum, c) => {
    return sum + (travelerCounts[c.key] || 0) * c.price
  }, 0)
}, [pricing, travelerCounts])

  /* ===============================
     DATE AVAILABILITY LOGIC
     =============================== */
  const closedWeekdays = attraction.closed_weekdays || []

  const isClosedDate = useMemo(() => {
    if (!selectedDate) return false
    const day = new Date(selectedDate).getDay()
    return closedWeekdays.includes(day)
  }, [selectedDate, closedWeekdays])

  const closedDayName = useMemo(() => {
    if (!isClosedDate || !selectedDate) return null
    return WEEKDAYS[new Date(selectedDate).getDay()]
  }, [isClosedDate, selectedDate])

  return (
    <div className="min-h-screen bg-gray-50">


      {/* ===============================
         HEADER
         =============================== */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            BookMyAttractions
          </Link>

          <div className="flex-1 max-w-xl">
            <SearchBar
              variant="header"
              getSuggestions={(q) =>
                getSuggestions(suggestionsData, q)
              }
              onSearch={(v) =>
                router.push({ pathname: '/search', query: { q: v } })
              }
              onSelect={(v) =>
                router.push({ pathname: '/search', query: { q: v } })
              }
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-700 ml-auto">
            <button className="hover:text-indigo-600">List Your Attraction</button>
            <button className="hover:text-indigo-600">Support</button>
            <button className="hover:text-indigo-600">EN/INR</button>
            <button className="hover:text-indigo-600">Profile</button>
          </div>
        </div>
      </header>

      {/* ===============================
         HERO
         =============================== */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold">{attraction.name}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
            <span>⭐ {attraction.rating} ({attraction.review_count} reviews)</span>
            <span>{attraction.city}, {attraction.state}</span>
          </div>

          <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-700">
            <span>⏱ {Math.round(attraction.duration_minutes / 60)} hours</span>
            <span>📱 Mobile ticket</span>
            <span>⚡ Instant confirmation</span>
            <span className="text-green-600 font-medium">
              Free cancellation
            </span>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {(attraction.images || []).slice(0, 5).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={attraction.name}
                className={`object-cover rounded-lg ${
                  i === 0
                    ? 'col-span-2 row-span-2 h-72'
                    : 'h-36'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===============================
         MAIN CONTENT
         =============================== */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">

          {/* ABOUT */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">
              About this experience
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {attraction.description}
            </p>
          </section>

          {/* HIGHLIGHTS */}
          {attraction.highlights?.length > 0 && (
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-3">Highlights</h2>
              <ul className="list-disc ml-5 space-y-1">
                {attraction.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </section>
          )}

          {/* INCLUDED / NOT INCLUDED */}
          {(attraction.includes?.length || attraction.excludes?.length) && (
            <section className="bg-white rounded-xl shadow p-6 grid md:grid-cols-2 gap-6">
              {attraction.includes?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">What’s included</h3>
                  <ul className="list-disc ml-5 space-y-1 text-gray-700">
                    {attraction.includes.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}

              {attraction.excludes?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">What’s not included</h3>
                  <ul className="list-disc ml-5 space-y-1 text-gray-700">
                    {attraction.excludes.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* ITINERARY */}
          {attraction.itinerary?.length > 0 && (
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                Itinerary
              </h2>

              <div className="space-y-4">
                {attraction.itinerary.map((step, i) => (
                  <div key={i} className="border-l-2 border-indigo-600 pl-4">
                    <h4 className="font-medium">
                      {step.title || `Stop ${i + 1}`}
                    </h4>
                    <p className="text-sm text-gray-700 mt-1">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* IMPORTANT INFO */}
          {attraction.important_info?.length > 0 && (
            <section className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-3">
                Know before you go
              </h2>
              <ul className="list-disc ml-5 space-y-1 text-gray-700">
                {attraction.important_info.map((info, i) => (
                  <li key={i}>{info}</li>
                ))}
              </ul>
            </section>
          )}

          {/* REVIEWS SUMMARY */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-2">
              Customer reviews
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">
                {attraction.rating}
              </span>
              <div>
                <p className="font-medium">
                  Excellent
                </p>
                <p className="text-sm text-gray-600">
                  Based on {attraction.review_count} reviews
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-xl shadow p-6 space-y-5">
            
            {/* DATE PICKER */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Select date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${
                  isClosedDate ? 'border-red-500' : ''
                }`}
              />

              {isClosedDate && (
                <p className="text-sm text-red-600 mt-2">
                  Closed on {closedDayName}. Please choose another day.
                </p>
              )}
            </div>

            {/* TRAVELERS DROPDOWN */}
            {pricing?.type === 'TIERED' && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowTravelers(v => !v)}
                  className="w-full flex justify-between items-center border rounded-lg px-4 py-3"
                >
                  <span className="text-sm font-medium">
                    {pricing.categories
                      .map(c => {
                        const count = travelerCounts[c.key] || 0
                        return count > 0 ? `${c.label} × ${count}` : null
                      })
                      .filter(Boolean)
                      .join(', ')}
                  </span>

                  <span className="text-lg">
                    {showTravelers ? '▲' : '▼'}
                  </span>
                </button>

                {showTravelers && (
                  <div className="border rounded-xl p-4 space-y-4 bg-white">
                    {pricing.categories.map(cat => (
                      <div
                        key={cat.key}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            {cat.label}
                            <span className="text-gray-500 font-normal">
                              {' '}({cat.age_label})
                            </span>
                          </p>

                          <p className="text-xs text-gray-500">
                            {cat.price === 0 ? 'Free' : `₹${cat.price} per person`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setTravelerCounts(c => ({
                                ...c,
                                [cat.key]:
                                  cat.key === 'ADULT'
                                    ? Math.max((c[cat.key] || 1) - 1, 1)
                                    : Math.max((c[cat.key] || 0) - 1, 0),
                              }))
                            }
                            className="w-8 h-8 border rounded-full flex items-center justify-center"
                          >
                            −
                          </button>

                          <span className="w-6 text-center">
                            {travelerCounts[cat.key] || 0}
                          </span>

                          <button
                            onClick={() =>
                              setTravelerCounts(c => ({
                                ...c,
                                [cat.key]: (c[cat.key] || 0) + 1,
                              }))
                            }
                            className="w-8 h-8 border rounded-full flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}

                    <p className="text-xs text-gray-500">
                      Ages 2 and younger do not require a ticket.
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* TOTAL PRICE */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">Total</p>

              <p className="text-2xl font-bold">
                ₹{totalPrice}
              </p>

              {pricing && (
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  {pricing.categories.map(cat => {
                    const count = travelerCounts[cat.key] || 0
                    if (count === 0 || cat.price === 0) return null

                    return (
                      <div key={cat.key} className="flex justify-between">
                        <span>
                          {cat.label} × {count}
                        </span>
                        <span>
                          ₹{count * cat.price}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Taxes included
              </p>
            </div>

            <button
              onClick={handleReserveNow}
              disabled={!selectedDate || isClosedDate}
              className={`w-full py-3 rounded-lg font-semibold text-white
                ${!selectedDate || isClosedDate
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'}
              `}
            >
              Reserve now
            </button>

            {isClosedDate && (
              <p className="text-xs text-red-600 mt-2">
                This experience is closed on {closedDayName}. Please choose another date.
              </p>
            )}

            <p className="text-xs text-gray-500">
              You won’t be charged yet
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

/* ===============================
   SERVER SIDE
================================ */
export async function getServerSideProps({ params }) {
  const { slug } = params

  const { data: attraction } = await supabase
    .from('attractions')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  const { data: suggestionsData } = await supabase
    .from('attractions')
    .select('name, city')
    .eq('is_active', true)

  return {
    props: {
      attraction: attraction || null,
      suggestionsData: suggestionsData || [],
    },
  }
}
