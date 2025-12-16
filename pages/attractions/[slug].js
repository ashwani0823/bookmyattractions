import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AttractionPage({ attraction }) {
  const [booking, setBooking] = useState({
    date: '',
    adults: 1,
    children: [],
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!attraction) {
    return <div className="p-8">Attraction not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto p-6">
          <h1 className="text-4xl font-bold">{attraction.name}</h1>
          <p className="text-gray-600 mt-1">
            {attraction.city}, {attraction.state}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-semibold text-indigo-600">
              ₹{attraction.price}
            </span>

            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-3 gap-6">
        {/* Left: Description + Highlights */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">
              {attraction.description || 'No description available.'}
            </p>
          </section>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Highlights</h2>
            <div className="flex gap-3 flex-wrap">
              {attraction.kids_friendly && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded">
                  Kids Friendly
                </span>
              )}
              {attraction.family_friendly && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">
                  Family Friendly
                </span>
              )}
              {attraction.outdoor && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded">
                  Outdoor
                </span>
              )}
            </div>
          </section>
        </div>

        {/* Right: Booking Card */}
        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h3 className="text-lg font-semibold mb-4">Book your visit</h3>

          {/* Date Picker */}
          <div className="mb-4">
            <label className="block mb-1 text-gray-600">Select Date</label>
            <input
              type="date"
              className="w-full border rounded px-4 py-2"
              value={booking.date}
              onChange={(e) =>
                setBooking((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          {/* Guests Dropdown */}
          <div className="relative">
            <label className="block mb-1 text-gray-600">Guests</label>
            <button
              type="button"
              className="w-full border rounded px-4 py-2 text-left"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {booking.adults} Adult{booking.adults > 1 ? 's' : ''}, {booking.children.length} Child{booking.children.length > 1 ? 'ren' : ''}
            </button>

            {dropdownOpen && (
              <div className="absolute bg-white border rounded shadow mt-1 w-full z-10 p-4 space-y-3">
                {/* Adults */}
                <div className="flex justify-between items-center">
                  <span>Adults</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBooking((prev) => ({
                          ...prev,
                          adults: Math.max(prev.adults - 1, 1),
                        }))
                      }
                      className="px-2 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span>{booking.adults}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setBooking((prev) => ({
                          ...prev,
                          adults: prev.adults + 1,
                        }))
                      }
                      className="px-2 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex justify-between items-center">
                  <span>Children</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBooking((prev) => ({
                          ...prev,
                          children: prev.children.slice(0, -1),
                        }))
                      }
                      className="px-2 bg-gray-200 rounded"
                    >
                      -
                    </button>
                    <span>{booking.children.length}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setBooking((prev) => ({
                          ...prev,
                          children: [...prev.children, 1],
                        }))
                      }
                      className="px-2 bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children ages */}
                {booking.children.map((age, idx) => (
                  <select
                    key={idx}
                    className="w-full border rounded px-2 py-1"
                    value={age}
                    onChange={(e) =>
                      setBooking((prev) => {
                        const updated = [...prev.children];
                        updated[idx] = Number(e.target.value);
                        return { ...prev, children: updated };
                      })
                    }
                  >
                    <option value="">Select age</option>
                    {Array.from({ length: 18 }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}
          </div>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg mt-4">
            Continue Booking
          </button>
        </div>
      </div>
    </div>
  );
}

/* SERVER SIDE FETCH */
export async function getServerSideProps({ params }) {
  const { slug } = params;

  const { data } = await supabase
    .from('attractions')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  return {
    props: {
      attraction: data || null,
    },
  };
}
