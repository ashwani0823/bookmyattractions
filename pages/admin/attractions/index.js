import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminAttractions() {
  const router = useRouter()
  const [attractions, setAttractions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        router.push('/admin')
        return
      }

      const { data } = await supabase
        .from('attractions')
        .select('*')
        .order('created_at', { ascending: false })

      setAttractions(data || [])
      setLoading(false)
    }

    checkAuthAndLoad()
  }, [router])

  if (loading) {
    return <div className="p-8">Loading attractions...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Attractions</h1>
        <Link
          href="/admin/attractions/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Attraction
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">City</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Rating</th>
              <th className="text-left p-4">Duration</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {attractions.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                {/* NAME */}
                <td className="p-4 font-medium">
                  {a.name}
                  {a.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {a.interests.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>

                {/* CITY */}
                <td className="p-4">{a.city}</td>

                {/* CATEGORY */}
                <td className="p-4 capitalize">
                  {a.category || '-'}
                </td>

                {/* PRICE */}
                <td className="p-4 font-semibold">
                  ₹{a.price}
                </td>

                {/* RATING */}
                <td className="p-4">
                  {a.rating ? (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{a.rating}</span>
                      <span className="text-gray-500 text-xs">
                        ({a.review_count || 0})
                      </span>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>

                {/* DURATION */}
                <td className="p-4">
                  {a.duration_minutes
                    ? `${a.duration_minutes} min`
                    : '-'}
                </td>

                {/* STATUS */}
                <td className="p-4">
                  {a.is_active ? (
                    <span className="text-green-600 font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Inactive
                    </span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-4">
                  <Link
                    href={`/admin/attractions/${a.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {attractions.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No attractions found.
          </div>
        )}
      </div>
    </div>
  )
}
