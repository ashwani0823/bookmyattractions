// pages/index.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import SearchBar from '../components/SearchBar'

export default function Home({ attractions }) {
  const router = useRouter()
  const [showHeaderSearch, setShowHeaderSearch] = useState(false)

  // Extract unique cities (priority first)
  const cities = [...new Set(attractions.map(a => a.city))]

  // Show header search only after scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowHeaderSearch(window.scrollY > 340)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Shared suggestion logic
  const getSuggestions = (query) => {
    if (query.length < 2) return []

    const cityMatches = cities
      .filter(city =>
        city.toLowerCase().includes(query.toLowerCase())
      )
      .map(city => ({
        type: 'city',
        value: city,
      }))

    const attractionMatches = attractions
      .filter(a =>
        a.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(a => ({
        type: 'attraction',
        value: a.name,
      }))

    return [...cityMatches, ...attractionMatches]
  }

  // Search handlers
  const handleSearch = (query) => {
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleSelect = (value) => {
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* STICKY HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">

          {/* LOGO */}
          <Link
            href="/"
            className="text-lg font-bold text-indigo-600 whitespace-nowrap"
          >
            BookMyAttractions
          </Link>

          {/* HEADER SEARCH (APPEARS ON SCROLL) */}
          <div
            className={`flex-1 max-w-xl transition-all duration-300 ${
              showHeaderSearch
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <SearchBar
              variant="header"
              getSuggestions={getSuggestions}
              onSearch={handleSearch}
              onSelect={handleSelect}
            />
          </div>

          {/* HEADER ACTIONS */}
          <div className="flex items-center gap-4 text-sm text-gray-700 whitespace-nowrap">
            <button className="hover:text-indigo-600">
              List Your Attraction
            </button>
            <button className="hover:text-indigo-600">Support</button>
            <button className="hover:text-indigo-600">EN/INR</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section
        className="min-h-[60vh] flex items-center bg-cover bg-center relative text-white"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover unforgettable experiences
          </h1>

          <p className="text-lg opacity-90 mb-12 max-w-2xl">
            Book museums, heritage sites & attractions across India
          </p>

          {/* HERO SEARCH */}
          <div className="w-full max-w-4xl">
            <SearchBar
              variant="hero"
              getSuggestions={getSuggestions}
              onSearch={handleSearch}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </section>

      {/* TRENDING ATTRACTIONS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-indigo-600 mb-8">
          Trending Attractions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {attractions.slice(0, 6).map((a) => (
            <div
              key={a.id}
              onClick={() => router.push(`/attractions/${a.slug}`)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
            >
              <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">
                Image Coming Soon
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold">{a.name}</h3>
                <p className="text-sm text-gray-600">
                  {a.city}, {a.state}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold">₹{a.price}</span>
                  <span className="text-indigo-600 font-semibold">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP DESTINATIONS */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-indigo-600 mb-8">
            Top Destinations
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Udaipur', 'Jaipur', 'Delhi', 'Agra'].map((city) => (
              <div
                key={city}
                onClick={() => router.push(`/search?q=${city}`)}
                className="border rounded-xl p-6 text-center hover:shadow-md cursor-pointer transition"
              >
                <div className="text-xl font-semibold">{city}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Explore attractions
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-14 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">
              BookMyAttractions
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Discover and book unforgettable attractions and experiences
              across India.
            </p>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-4 uppercase">
              Company
            </h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-white mb-4 uppercase">
              Legal
            </h5>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BookMyAttractions. All rights reserved.
        </div>
      </footer>

    </div>
  )
}

export async function getServerSideProps() {
  const { data } = await supabase
    .from('attractions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return {
    props: {
      attractions: data || [],
    },
  }
}
