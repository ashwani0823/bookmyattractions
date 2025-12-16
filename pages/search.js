// pages/search.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function SearchPage({ attractions, initialQuery }) {
  const router = useRouter();

  const [search, setSearch] = useState(initialQuery.q || '');
  const [date, setDate] = useState(initialQuery.date || '');
  const [adults, setAdults] = useState(Number(initialQuery.adults) || 1);
  const [children, setChildren] = useState(Number(initialQuery.children) || 0);
  const [childrenAges, setChildrenAges] = useState(
    initialQuery.childrenAges
      ? initialQuery.childrenAges.split(',').map(Number)
      : []
  );
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  // Trigger new search
  const handleSearch = () => {
    router.push({
      pathname: '/search',
      query: {
        q: search,
        date,
        adults,
        children,
        childrenAges: childrenAges.join(','),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEARCH BAR */}
      <section className="bg-white shadow-md py-6 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search attractions or city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
          />

          {/* Guest Picker */}
          <div className="relative">
            <button
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              className="w-full border rounded-lg px-4 py-3 text-left"
            >
              {adults} Adult{adults > 1 ? 's' : ''}, {children} Child{children !== 1 ? 'ren' : ''}
            </button>

            {showGuestDropdown && (
              <div className="absolute bg-white border rounded-xl shadow-lg mt-2 w-full p-4 space-y-4 z-40">
                {/* Adults */}
                <div className="flex justify-between items-center">
                  <span>Adults</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="px-3 py-1 border rounded"
                    >-</button>
                    <span>{adults}</span>
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="px-3 py-1 border rounded"
                    >+</button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex justify-between items-center">
                  <span>Children</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (children > 0) {
                          setChildren(children - 1);
                          setChildrenAges(childrenAges.slice(0, -1));
                        }
                      }}
                      className="px-3 py-1 border rounded"
                    >-</button>
                    <span>{children}</span>
                    <button
                      onClick={() => {
                        setChildren(children + 1);
                        setChildrenAges([...childrenAges, 5]);
                      }}
                      className="px-3 py-1 border rounded"
                    >+</button>
                  </div>
                </div>

                {/* Children Ages */}
                {childrenAges.map((age, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-sm">Child {idx + 1} age</span>
                    <select
                      value={age}
                      onChange={(e) => {
                        const updated = [...childrenAges];
                        updated[idx] = Number(e.target.value);
                        setChildrenAges(updated);
                      }}
                      className="border rounded px-2 py-1"
                    >
                      {Array.from({ length: 18 }, (_, i) => i + 1).map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                ))}

                <button
                  onClick={() => setShowGuestDropdown(false)}
                  className="w-full bg-indigo-600 text-white rounded-lg py-2"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-indigo-700"
          >
            Search
          </button>
        </div>
      </section>

      {/* RESULTS */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">
          {attractions.length} Experiences Found
        </h2>

        {attractions.length === 0 ? (
          <p className="text-gray-600">No attractions found.</p>
        ) : (
          <div className="space-y-6">
            {attractions.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition flex overflow-hidden"
              >
                {/* Image */}
                <div className="w-48 h-36 bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                  Image
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{a.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {a.city}, {a.state}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {a.kids_friendly && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Kids Friendly
                        </span>
                      )}
                      {a.family_friendly && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Family Friendly
                        </span>
                      )}
                      {a.outdoor && (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          Outdoor
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold">₹{a.price}</span>
                    <a
                      href={`/attractions/${a.slug}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const { q = '' } = query;

  let supabaseQuery = supabase
    .from('attractions')
    .select('*')
    .eq('is_active', true);

  if (q) {
    supabaseQuery = supabaseQuery.or(
      `name.ilike.%${q}%,city.ilike.%${q}%`
    );
  }

  const { data } = await supabaseQuery;

  return {
    props: {
      attractions: data || [],
      initialQuery: query,
    },
  };
}
