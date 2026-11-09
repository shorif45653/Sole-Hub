import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import FilterPanel from '../components/FilterPanel'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { formatPrice } from '../utils/formatCurrency'
import { getProducts, getCategories, getBrands } from '../services/productService'

const DEFAULT_BRANDS = ['Nike', 'Adidas', 'ASICS', 'PUMA']

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 })
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const { addToCart } = useCart()

  const currentPage = parseInt(searchParams.get('page')) || 1
  const limit = 12

  const loadData = async () => {
    setLoading(true)
    try {
      const filters = {
        category: searchParams.get('category') || 'all',
        brand: searchParams.get('brand') || 'all',
        search: searchParams.get('search') || '',
        minPrice: searchParams.get('minPrice') || undefined,
        maxPrice: searchParams.get('maxPrice') || undefined,
        size: searchParams.get('size') || undefined,
        sort: searchParams.get('sort') || 'newest',
        page: currentPage,
        limit
      }

      const [productsResult, categoriesResult, brandsResult] = await Promise.all([
        fetchProducts(filters),
        fetchCategories(),
        fetchBrands()
      ])

      setProducts(productsResult.data || [])
      setCategories(categoriesResult || [])
      setBrands(brandsResult || [])

      const allSizes = [...new Set(productsResult.data?.flatMap(p => p.sizes || []).filter(Boolean))]
      setSizes(allSizes)

      if (productsResult.data && productsResult.data.length > 0) {
        const prices = productsResult.data.map(p => p.price)
        setPriceRange({ min: Math.min(...prices), max: Math.max(...prices) })
      }
    } catch (err) {
      console.error('Shop load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async (filters) => {
    return getProducts(filters)
  }

  const fetchCategories = async () => {
    return getCategories()
  }

  const fetchBrands = async () => {
    const fetchedBrands = await getBrands()
    // Merge default brands with fetched brands, ensuring defaults appear first
    const allBrands = [...DEFAULT_BRANDS, ...fetchedBrands.filter(b => !DEFAULT_BRANDS.includes(b))]
    return allBrands
  }

  const handleQuickAdd = async product => {
    if (!product.sizes?.[0]) return
    await addToCart(product.id, product.sizes[0], product.colors?.[0] || null, 1, product)
  }

  useEffect(() => {
    loadData()
  }, [searchParams])

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '')
  }, [searchParams])

  const handleSearch = event => {
    event.preventDefault()
    const nextParams = new URLSearchParams(searchParams)
    if (searchQuery.trim()) nextParams.set('search', searchQuery.trim())
    else nextParams.delete('search')
    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  const totalCount = products.length

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-header">
          <div className="container">
            <h1>Shop</h1>
            <div className="loading-skeleton-grid" />
          </div>
        </div>
        <div className="container shop-content">
          <div className="shop-filters-mobile">
            <button onClick={() => setFilterOpen(true)} className="btn btn--outline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              Filters
            </button>
          </div>
          <div className="empty-state">
            <LoadingSpinner size="lg" text="Loading products..." />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="container">
          <h1>Shop</h1>
          <p className="shop-subtitle">Find your perfect pair.</p>
          <form className="shop-search-inline" onSubmit={handleSearch}>
            <input type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search shoes..." className="form-input" aria-label="Search shoes" />
            <button type="submit" className="btn btn--primary btn--small">Search</button>
          </form>
          <div className="shop-count">{totalCount} products found</div>
        </div>
      </div>

      <div className="container shop-content">
        <div className="shop-filters-mobile">
          <button onClick={() => setFilterOpen(true)} className="btn btn--outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            Filters
          </button>
        </div>

        <div className="shop-main">
          <aside className="shop-sidebar desktop-only">
            <FilterPanel
              categories={categories}
              brands={brands}
              priceRange={priceRange}
              sizes={sizes}
              isOpen={true}
              onClose={() => setFilterOpen(false)}
            />
          </aside>

          <div className="shop-product-area">
            <div className="shop-results-header">
              <span className="shop-results-count">{totalCount} results</span>
            </div>

            {!loading && error && (
              <ErrorMessage
                title="Unable to load products"
                message={error}
                onRetry={loadData}
                retryLabel="Try Again"
              />
            )}

            {!loading && !error && products.length > 0 ? (
              <div className="product-grid grid grid--4">
                {products.map(product => {
                  const { original, discounted, hasDiscount, discountPercent } = formatPrice(product.price, product.discount_price)
                  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  return <ProductCard key={product.id} product={product} variant="default" onQuickAdd={handleQuickAdd} />
                })}
              </div>
            ) : (
              !loading && !error && products.length === 0 && <EmptyState type="search" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop