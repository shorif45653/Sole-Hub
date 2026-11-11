import { X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
const FilterPanel = ({ 
  categories = [], 
  brands = [], 
  priceRange = { min: 0, max: 20000 },
  sizes = [],
  isOpen = false,
  onClose,
  className = ''
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
    size: true
  })

  const getParam = (key) => searchParams.get(key) || ''
  const getParamArray = (key) => searchParams.getAll(key).filter(Boolean)

  const activeFilters = {
    category: getParam('category'),
    brand: getParam('brand'),
    minPrice: getParam('minPrice'),
    maxPrice: getParam('maxPrice'),
    size: getParamArray('size'),
    sort: getParam('sort') || 'newest'
  }

  const hasActiveFilters = Object.values(activeFilters).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== ''
  )

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(value)) {
        params.delete(key)
        value.forEach(v => params.append(key, v))
      } else {
        params.set(key, value)
      }
    })
    params.delete('page')
    setSearchParams(params)
  }

  const toggleSize = (size) => {
    const current = activeFilters.size
    if (current.includes(size)) {
      updateParams({ size: current.filter(s => s !== size) })
    } else {
      updateParams({ size: [...current, size] })
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams()
    params.set('sort', 'newest')
    setSearchParams(params)
  }

  if (!isOpen) return null
  return (
    <aside className={`filter-panel ${className} open`} role="complementary" aria-label="Product filters">
      <div className="filter-panel__header">
        <h2 className="filter-panel__title">Filters</h2>
        <button 
          className="filter-panel__close" 
          onClick={onClose}
          aria-label="Close filters"
        >
          <X size={24} />
        </button>
      </div>

      <div className="filter-panel__content">
        {/* Category Filter */}
        <FilterSection
          title="Category"
          expanded={expandedSections.category}
          onToggle={() => toggleSection('category')}
        >
          <ul className="filter-options">
            {categories.map(category => (
              <li key={category}>
                <label className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={activeFilters.category === category}
                    onChange={(e) => updateParams({ category: e.target.value })}
                    className="filter-option__input"
                  />
                  <span className="filter-option__label">{category}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>

        {/* Brand Filter */}
        <FilterSection
          title="Brand"
          expanded={expandedSections.brand}
          onToggle={() => toggleSection('brand')}
        >
          <ul className="filter-options">
            {brands.map(brand => (
              <li key={brand}>
                <label className="filter-option">
                  <input
                    type="checkbox"
                    value={brand}
                    checked={activeFilters.brand === brand}
                    onChange={(e) => updateParams({ brand: e.target.checked ? brand : '' })}
                    className="filter-option__input"
                  />
                  <span className="filter-option__label">{brand}</span>
                </label>
              </li>
            ))}
          </ul>
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection
          title="Price Range"
          expanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="price-range">
            <div className="price-range__inputs">
              <div className="form-group">
                <label htmlFor="min-price" className="form-label">Min</label>
                <input
                  id="min-price"
                  type="number"
                  value={activeFilters.minPrice || ''}
                  onChange={(e) => updateParams({ minPrice: e.target.value || '' })}
                  min={priceRange.min}
                  max={priceRange.max}
                  className="form-input form-input--small"
                  placeholder={priceRange.min}
                />
              </div>
              <div className="form-group">
                <label htmlFor="max-price" className="form-label">Max</label>
                <input
                  id="max-price"
                  type="number"
                  value={activeFilters.maxPrice || ''}
                  onChange={(e) => updateParams({ maxPrice: e.target.value || '' })}
                  min={priceRange.min}
                  max={priceRange.max}
                  className="form-input form-input--small"
                  placeholder={priceRange.max}
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Size Filter */}
        <FilterSection
          title="Size"
          expanded={expandedSections.size}
          onToggle={() => toggleSection('size')}
        >
          <div className="filter-sizes">
            {sizes.map(size => (
              <button
                key={size}
                type="button"
                className={`filter-size ${activeFilters.size.includes(size) ? 'active' : ''}`}
                onClick={() => toggleSize(size)}
                aria-pressed={activeFilters.size.includes(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Sort */}
        <div className="filter-section filter-section--sort">
          <label htmlFor="sort-select" className="form-label">Sort By</label>
          <select
            id="sort-select"
            value={activeFilters.sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="form-select form-select--small"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filter-panel__footer">
          <button
            type="button"
            className="btn btn--ghost filter-panel__clear"
            onClick={clearAllFilters}
          >
            <X size={16} />
            Clear All Filters
          </button>
        </div>
      )}
    </aside>
  )
}

const FilterSection = ({ title, expanded, onToggle, children }) => (
  <div className="filter-section">
    <button
      type="button"
      className="filter-section__header"
      onClick={onToggle}
      aria-expanded={expanded}
    >
      <span className="filter-section__title">{title}</span>
      <span className="filter-section__icon">
        {expanded ? '˄' : '˅'}
      </span>
    </button>
    <div className={`filter-section__content ${expanded ? 'open' : ''}`}>
      {children}
    </div>
  </div>
)

export default FilterPanel