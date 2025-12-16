import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function AdminAttractions() {
  const router = useRouter();
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        router.push('/admin');
        return;
      }

      const { data } = await supabase
        .from('attractions')
        .select('*')
        .order('created_at', { ascending: false });

      setAttractions(data || []);
      setLoading(false);
    };

    checkAuthAndLoad();
  }, [router]);

  if (loading) {
    return <div className="p-8">Loading attractions...</div>;
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

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">City</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attractions.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-4">{a.name}</td>
                <td className="p-4">{a.city}</td>
                <td className="p-4">₹{a.price}</td>
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
      </div>
    </div>
  );
}
