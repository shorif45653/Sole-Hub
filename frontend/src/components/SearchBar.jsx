import { Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const SearchBar = ({ placeholder = 'Search shoes...', className = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const param = searchParams.get('search')
    if (param !== query) {
      setQuery(param || '')
    }
  }, [searchParams])

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (query.trim()) {
      params.set('search', query.trim())
    } else {
      params.delete('search')
    }
    params.delete('page')
    setSearchParams(params)
  }

  const handleClear = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setQuery('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    params.delete('page')
    setSearchParams(params)
  }

  return (
    <form onSubmit={handleSubmit} className={`search-bar ${className} ${isFocused ? 'focused' : ''} ${query ? 'has-value' : ''}`} role="search">
      <label htmlFor="search-input" className="visually-hidden">Search products</label>
      <div className="search-bar__input-wrapper">
        <Search 
          className="search-bar__icon" 
          size={20} 
          aria-hidden="true"
        />
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="search-bar__input"
          autoComplete="off"
          aria-label="Search products"
        />
        {query && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <button type="submit" className="search-bar__submit" aria-label="Search">
        <Search size={18} />
      </button>
    </form>
  )
}

export default SearchBar