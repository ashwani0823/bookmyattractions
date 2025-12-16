import { useState, useEffect, useRef } from 'react'

export default function SearchBar({
  variant = 'hero',
  getSuggestions,
  onSelect,
  onSearch,
}) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  const isHero = variant === 'hero'

  useEffect(() => {
    if (value.length < 2) {
      setSuggestions([])
      return
    }

    const results = getSuggestions(value)
    setSuggestions(results)
    setShowSuggestions(true)
  }, [value])

  // Outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (val) => {
    setValue(val)
    setShowSuggestions(false)
    onSelect(val)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={`bg-white flex items-center gap-3 shadow-2xl
        ${isHero ? 'rounded-2xl p-3' : 'rounded-lg px-3 py-2'}`}
      >
        <input
          type="text"
          placeholder="Search attractions or city"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
          className={`flex-1 border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800
          ${isHero ? 'px-6 py-5 text-lg rounded-xl' : 'px-3 py-2 text-sm rounded-md'}`}
        />

        <button
          onClick={() => onSearch(value)}
          className={`bg-indigo-600 text-white font-semibold hover:bg-indigo-700
          ${isHero ? 'px-6 py-3 rounded-xl' : 'px-4 py-2 rounded-md text-sm'}`}
        >
          Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg z-50">
          {suggestions.map((item, index) => (
            <div
              key={index}
              onMouseDown={() => handleSelect(item.value)}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 text-left"
            >
              <div className="text-sm font-medium text-gray-900">
                {item.value}
              </div>
              <div className="text-xs text-gray-500">
                {item.type === 'city' ? 'City' : 'Attraction'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
