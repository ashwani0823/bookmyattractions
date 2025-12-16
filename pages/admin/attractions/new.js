import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function NewAttraction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    price: '',
    description: '',
    kids_friendly: false,
    family_friendly: false,
    outdoor: false,
    is_active: true,
  });

  // 🔐 Basic auth check
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/admin');
      }
    };

    checkAuth();
  }, [router]);

  // ✍️ Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 🧠 Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // 💾 Save attraction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name) {
      alert('Attraction name is required');
      setLoading(false);
      return;
    }

    const slug = generateSlug(form.name);

    const { error } = await supabase.from('attractions').insert([
      {
        name: form.name,
        slug: slug, // ✅ REQUIRED FIELD FIXED
        city: form.city,
        state: form.state,
        price: Number(form.price),
        description: form.description,
        kids_friendly: form.kids_friendly,
        family_friendly: form.family_friendly,
        outdoor: form.outdoor,
        is_active: form.is_active,
      },
    ]);

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push('/admin/attractions');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Add Attraction</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow max-w-xl space-y-4"
      >
        <input
          name="name"
          placeholder="Attraction Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            required
            className="border rounded px-4 py-2"
          />

          <input
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            required
            className="border rounded px-4 py-2"
          />
        </div>

        <input
          name="price"
          type="number"
          placeholder="Price (₹)"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full border rounded px-4 py-2"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        />

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="kids_friendly"
              checked={form.kids_friendly}
              onChange={handleChange}
            />
            Kids Friendly
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="family_friendly"
              checked={form.family_friendly}
              onChange={handleChange}
            />
            Family Friendly
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="outdoor"
              checked={form.outdoor}
              onChange={handleChange}
            />
            Outdoor
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Active (visible on website)
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          {loading ? 'Saving...' : 'Save Attraction'}
        </button>
      </form>
    </div>
  );
}
