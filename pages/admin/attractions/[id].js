import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'

export default function EditAttraction() {
  const router = useRouter()
  const { id } = router.query

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    city: '',
    state: '',
    description: '',
    price: '',

    kids_friendly: false,
    family_friendly: false,
    wheelchair_accessible: false,
    outdoor: false,
    is_active: true,

    category: '',
    interests: '',
    duration_minutes: '',
    start_time: '',
    rating: '',
    review_count: '',
  })

  useEffect(() => {
    if (!id) return

    const loadAttraction = async () => {
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/admin/attractions')
        return
      }

      setForm({
        name: data.name || '',
        slug: data.slug || '',
        city: data.city || '',
        state: data.state || '',
        description: data.description || '',
        price: data.price || '',

        kids_friendly: data.kids_friendly || false,
        family_friendly: data.family_friendly || false,
        wheelchair_accessible: data.wheelchair_accessible || false,
        outdoor: data.outdoor || false,
        is_active: data.is_active ?? true,

        category: data.category || '',
        interests: (data.interests || []).join(', '),
        duration_minutes: data.duration_minutes || '',
        start_time: data.start_time || '',
        rating: data.rating || '',
        review_count: data.review_count || '',
      })

      setLoading(false)
    }

    loadAttraction()
  }, [id, router])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const slug = generateSlug(form.name)

    const { error } = await supabase
      .from('attractions')
      .update({
        name: form.name,
        slug,
        city: form.city,
        state: form.state,
        description: form.description,
        price: Number(form.price),

        kids_friendly: form.kids_friendly,
        family_friendly: form.family_friendly,
        wheelchair_accessible: form.wheelchair_accessible,
        outdoor: form.outdoor,
        is_active: form.is_active,

        category: form.category,
        interests: form.interests
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),

        duration_minutes: Number(form.duration_minutes) || null,
        start_time: form.start_time || null,
        rating: Number(form.rating) || 0,
        review_count: Number(form.review_count) || 0,
      })
      .eq('id', id)

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    router.push('/admin/attractions')
  }

  if (loading) {
    return <div className="p-8">Loading attraction...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Attraction</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow max-w-2xl space-y-4"
      >
        {/* BASIC INFO */}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          placeholder="Attraction name"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            className="border rounded px-4 py-2"
            placeholder="City"
          />
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="border rounded px-4 py-2"
            placeholder="State"
          />
        </div>

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          placeholder="Description"
        />

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          placeholder="Price"
        />

        {/* CATEGORY */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
        >
          <option value="">Select category</option>
          <option value="tour">Tour</option>
          <option value="attraction">Attraction</option>
          <option value="entry_ticket">Entry Ticket</option>
          <option value="activity">Activity</option>
        </select>

        {/* INTERESTS */}
        <input
          name="interests"
          value={form.interests}
          onChange={handleChange}
          className="w-full border rounded px-4 py-2"
          placeholder="Interests (comma separated)"
        />

        {/* DURATION & TIME */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="duration_minutes"
            value={form.duration_minutes}
            onChange={handleChange}
            className="border rounded px-4 py-2"
            placeholder="Duration (minutes)"
          />
          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            className="border rounded px-4 py-2"
          />
        </div>

        {/* RATING */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className="border rounded px-4 py-2"
            placeholder="Rating (0–5)"
          />
          <input
            type="number"
            name="review_count"
            value={form.review_count}
            onChange={handleChange}
            className="border rounded px-4 py-2"
            placeholder="Review count"
          />
        </div>

        {/* FLAGS */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label><input type="checkbox" name="kids_friendly" checked={form.kids_friendly} onChange={handleChange} /> Kids friendly</label>
          <label><input type="checkbox" name="family_friendly" checked={form.family_friendly} onChange={handleChange} /> Family friendly</label>
          <label><input type="checkbox" name="wheelchair_accessible" checked={form.wheelchair_accessible} onChange={handleChange} /> Wheelchair accessible</label>
          <label><input type="checkbox" name="outdoor" checked={form.outdoor} onChange={handleChange} /> Outdoor</label>
        </div>

        <label className="flex items-center gap-2 text-sm">
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
  )
}
