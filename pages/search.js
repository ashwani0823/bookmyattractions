// pages/search.js
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import SearchBar from '../components/SearchBar'

/* ===============================
   CONFIG
================================ */
const PAGE_SIZE = 6

const DURATION_BUCKETS = {
  short: { label: 'Up to 2 hours', min: 0, max: 120 },
  half_day: { label: '2–6 hours', min: 121, max: 360 },
  full_day: { label: '6+ hours', min: 361, max: Infinity },
}

const START_TIME_BUCKETS = {
  morning: { label: 'Morning (5am – 12pm)', min: 300, max: 719 },
  afternoon: { label: 'Afternoon (12pm – 5pm)', min: 720, max: 1019 },
  evening: { label: 'Evening (5pm – 10pm)', min: 1020, max: 1319 },
}

const timeToMinutes = (t) => {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/* ===============================
   🔹 AUTOCOMPLETE (SAME IDEA AS INDEX)
================================ */
const getSuggestions = (attractions, query) => {
  if (!query || query.length < 2) return []

  const q = query.toLowerCase()
  const seenCities = new Set()
  const results = []

  attractions.forEach(a => {
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

/* ===============================
   PAGE
================================ */
export default function SearchPage({ attractions }) {
  const router = useRouter()
  const { query } = router

  /* ===============================
     1️⃣ FILTERS FROM URL
     =============================== */
  const filters = useMemo(() => ({
    q: query.q || '',
    sort: query.sort || 'relevance',
    category: query.category || '',
    price_min: query.price_min ? Number(query.price_min) : null,
    price_max: query.price_max ? Number(query.price_max) : null,
    rating_min: query.rating_min ? Number(query.rating_min) : null,
    interests: query.interests ? query.interests.split(',') : [],
    duration: query.duration ? query.duration.split(',') : [],
    start_time: query.start_time ? query.start_time.split(',') : [],
  }), [query])

  const {
    q,
    sort,
    category,
    price_min,
    price_max,
    rating_min,
    interests,
    duration,
    start_time,
  } = filters

  /* ===============================
     PRICE RANGE (DATA-DRIVEN)
     =============================== */
  const prices = useMemo(
    () => attractions.map(a => a.price).filter(Boolean),
    [attractions]
  )

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  /* ===============================
     2️⃣ FILTER + SORT RESULTS
     =============================== */
  const [filtered, setFiltered] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef(null)

  useEffect(() => {
    let result = [...attractions]

    if (q) {
      result = result.filter(a =>
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.city.toLowerCase().includes(q.toLowerCase())
      )
    }

    if (category) result = result.filter(a => a.category === category)
    if (price_min !== null) result = result.filter(a => a.price >= price_min)
    if (price_max !== null) result = result.filter(a => a.price <= price_max)
    if (rating_min !== null)
      result = result.filter(a => (a.rating || 0) >= rating_min)

    if (interests.length > 0) {
      result = result.filter(a =>
        a.interests?.some(i => interests.includes(i))
      )
    }

    if (duration.length > 0) {
      result = result.filter(a =>
        duration.some(key => {
          const b = DURATION_BUCKETS[key]
          return (
            b &&
            a.duration_minutes >= b.min &&
            a.duration_minutes <= b.max
          )
        })
      )
    }

    if (start_time.length > 0) {
      result = result.filter(a => {
        const mins = timeToMinutes(a.start_time)
        return start_time.some(key => {
          const b = START_TIME_BUCKETS[key]
          return b && mins >= b.min && mins <= b.max
        })
      })
    }

    switch (sort) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        break
    }

    setFiltered(result)
    setVisibleCount(PAGE_SIZE)
  }, [filters, attractions])

  /* ===============================
     3️⃣ INFINITE SCROLL
     =============================== */
  useEffect(() => {
    if (!loadMoreRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(v =>
            Math.min(v + PAGE_SIZE, filtered.length)
          )
        }
      },
      { threshold: 1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [filtered])

  /* ===============================
     4️⃣ URL HELPERS
     =============================== */
  const updateQuery = (updates = {}) => {
    const next = { ...query, ...updates }
    Object.keys(next).forEach(k => {
      if (!next[k] && next[k] !== 0) delete next[k]
    })
    router.push({ pathname: '/search', query: next })
  }

  const toggleMulti = (key, list, param) => {
    const updated = list.includes(key)
      ? list.filter(i => i !== key)
      : [...list, key]

    updateQuery({
      [param]: updated.length ? updated.join(',') : undefined,
    })
  }

  const clearFilters = () => {
    updateQuery({
      category: undefined,
      price_min: undefined,
      price_max: undefined,
      rating_min: undefined,
      interests: undefined,
      duration: undefined,
      start_time: undefined,
      sort: 'relevance',
    })
  }

  /* ===============================
     RENDER
     =============================== */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-xl font-bold text-indigo-600 whitespace-nowrap">
            BookMyAttractions
          </Link>

          <div className="flex-1 max-w-xl">
            <SearchBar
            variant="header"
            getSuggestions={(q) => getSuggestions(attractions, q)}
            onSearch={(v) => updateQuery({ q: v })}
            onSelect={(v) => updateQuery({ q: v })}
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-700 whitespace-nowrap ml-auto">
            <button className="hover:text-indigo-600">List Your Attraction</button>
            <button className="hover:text-indigo-600">Support</button>
            <button className="hover:text-indigo-600">EN/INR</button>
            <button className="hover:text-indigo-600">Profile</button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* FILTERS */}
        <aside className="bg-white rounded-xl shadow p-6 space-y-6 h-fit">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-600 hover:underline"
            >
              Clear all
            </button>
          </div>

          {/* CATEGORY */}
          <div>
            <h4 className="text-sm font-medium mb-2">Category</h4>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={!category}
                onChange={() => updateQuery({ category: undefined })}
              />
              All
            </label>

            {['tour', 'attraction', 'entry_ticket', 'activity'].map(c => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={category === c}
                  onChange={() => updateQuery({ category: c })}
                />
                {c.replace('_', ' ')}
              </label>
            ))}
          </div>

          {/* PRICE */}
          <div>
            <h4 className="text-sm font-medium mb-2">Price (₹)</h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={price_min ?? ''}
                onChange={(e) => updateQuery({ price_min: e.target.value })}
                className="border rounded px-2 py-1 w-full"
              />
              <input
                type="number"
                placeholder="Max"
                value={price_max ?? ''}
                onChange={(e) => updateQuery({ price_max: e.target.value })}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
          </div>

          {/* INTERESTS */}
          <div>
            <h4 className="text-sm font-medium mb-2">Interests</h4>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={interests.length === 0}
                onChange={() => updateQuery({ interests: undefined })}
              />
              All
            </label>

            {[...new Set(attractions.flatMap(a => a.interests || []))].map(i => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={interests.includes(i)}
                  onChange={() => toggleMulti(i, interests, 'interests')}
                />
                {i}
              </label>
            ))}
          </div>

          {/* DURATION */}
          <div>
            <h4 className="text-sm font-medium mb-2">Duration</h4>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={duration.length === 0}
                onChange={() => updateQuery({ duration: undefined })}
              />
              All
            </label>

            {Object.entries(DURATION_BUCKETS).map(([k, v]) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={duration.includes(k)}
                  onChange={() => toggleMulti(k, duration, 'duration')}
                />
                {v.label}
              </label>
            ))}
          </div>

          {/* RATING */}
          <div>
            <h4 className="text-sm font-medium mb-2">Rating</h4>
            {[null, 4, 3].map(v => (
              <label key={v ?? 'all'} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={rating_min === v}
                  onChange={() => updateQuery({ rating_min: v })}
                />
                {v ? `${v}★ & above` : 'All'}
              </label>
            ))}
          </div>
        </aside>

        {/* RESULTS */}
        <section className="space-y-6 md:col-span-3">
          <h2 className="text-xl font-semibold">
            {filtered.length} results found
          </h2>

          {filtered.slice(0, visibleCount).map(a => (
            <div
              key={a.id}
              onClick={() => router.push(`/attractions/${a.slug}`)}
              className="bg-white rounded-xl shadow hover:shadow-lg p-4 flex gap-6 cursor-pointer"
            >
              <div className="w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0" />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{a.name}</h3>
                  <p className="text-sm text-gray-600">
                    {a.city}, {a.state}
                  </p>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    ⭐ {a.rating} ({a.review_count})
                    ⏱ {Math.round(a.duration_minutes / 60)} hrs
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-lg">₹{a.price}</span>
                  <span className="text-indigo-600 font-semibold">
                    View details →
                  </span>
                </div>
              </div>
            </div>
          ))}

          {visibleCount < filtered.length && (
            <div ref={loadMoreRef} className="h-10" />
          )}
        </section>
      </div>
    </div>
  )
}

/* ===============================
   SERVER
================================ */
export async function getServerSideProps() {
  const { data } = await supabase
    .from('attractions')
    .select('*')
    .eq('is_active', true)

  return { props: { attractions: data || [] } }
}
