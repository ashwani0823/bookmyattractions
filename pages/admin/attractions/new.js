import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'

export default function AddAttraction() {
  const router = useRouter()

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

    // NEW FIELDS
    category: '',
    interests: '',
    duration_minutes: '',
    start_time: '',
    rating: '',
    review_count: '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error } = await supabase.from('attractions').insert([
      {
        ...form,
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes),
        rating: Number(form.rating),
        review_count: Number(form.review_count),
        interests: form.interests
          .split(',')
          .map(i => i.trim())
          .filter(Boolean),
      },
    ])

    if (!error) {
      router.push('/admin/attractions')
    } else {
      alert(error.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Add Attraction</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* BASIC INFO */}
        <input name="name" placeholder="Name" onChange={handleChange} className="w-full border p-2" required />
        <input name="slug" placeholder="Slug (taj-mahal-agra)" onChange={handleChange} className="w-full border p-2" required />
        <input name="city" placeholder="City" onChange={handleChange} className="w-full border p-2" required />
        <input name="state" placeholder="State" onChange={handleChange} className="w-full border p-2" required />

        <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full border p-2" />

        <input type="number" name="price" placeholder="Price" onChange={handleChange} className="w-full border p-2" required />

        {/* CATEGORY */}
        <select name="category" onChange={handleChange} className="w-full border p-2" required>
          <option value="">Select Category</option>
          <option value="tour">Tour</option>
          <option value="attraction">Attraction</option>
          <option value="entry_ticket">Entry Ticket</option>
          <option value="activity">Activity</option>
        </select>

        {/* INTERESTS */}
        <input
          name="interests"
          placeholder="Interests (comma separated)"
          onChange={handleChange}
          className="w-full border p-2"
        />
        <p className="text-xs text-gray-500">
          Example: heritage, museum, history
        </p>

        {/* DURATION & TIME */}
        <input
          type="number"
          name="duration_minutes"
          placeholder="Duration (minutes)"
          onChange={handleChange}
          className="w-full border p-2"
        />

        <input
          type="time"
          name="start_time"
          onChange={handleChange}
          className="w-full border p-2"
        />

        {/* RATING */}
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          name="rating"
          placeholder="Rating (0–5)"
          onChange={handleChange}
          className="w-full border p-2"
        />

        <input
          type="number"
          name="review_count"
          placeholder="Review count"
          onChange={handleChange}
          className="w-full border p-2"
        />

        {/* FLAGS */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label><input type="checkbox" name="kids_friendly" onChange={handleChange} /> Kids friendly</label>
          <label><input type="checkbox" name="family_friendly" onChange={handleChange} /> Family friendly</label>
          <label><input type="checkbox" name="wheelchair_accessible" onChange={handleChange} /> Wheelchair accessible</label>
          <label><input type="checkbox" name="outdoor" onChange={handleChange} /> Outdoor</label>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
        >
          Save Attraction
        </button>
      </form>
    </div>
  )
}
