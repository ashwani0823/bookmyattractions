import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function EditAttraction() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (!id) return;

    const loadAttraction = async () => {
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/admin/attractions');
        return;
      }

      setForm({
        name: data.name,
        city: data.city,
        state: data.state,
        price: data.price,
        description: data.description,
        kids_friendly: data.kids_friendly,
        family_friendly: data.family_friendly,
        outdoor: data.outdoor,
        is_active: data.is_active,
      });

      setLoading(false);
    };

    loadAttraction();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const slug = generateSlug(form.name);

    const { error } = await supabase
      .from('attractions')
      .update({
        ...form,
        slug,
        price: Number(form.price),
      })
      .eq('id', id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push('/admin/attractions');
  };

  if (loading) {
    return <div className="p-8">Loading attraction...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Attraction</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow max-w-xl space-y-4"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />

          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
        </div>

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        />

        <textarea
          name="description"
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
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          {saving ? 'Saving...' : 'Update Attraction'}
        </button>
      </form>
    </div>
  );
}
