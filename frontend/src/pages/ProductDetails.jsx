import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../services/supabase'
import { formatPrice } from '../utils/formatCurrency'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorMessage from '../components/ErrorMessage'
import ProductCard from '../components/ProductCard'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartError, setCartError] = useState(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      if (!data || !data.is_active) {
        setError('Product not found or no longer available')
        setLoading(false)
        return
      }
      
      setProduct(data)
      setSelectedSize(data.sizes?.[0] || null)
      setSelectedColor(data.colors?.[0] || null)
      setQuantity(1)

      const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', data.category)
        .neq('id', id)
        .limit(4)
      
      setRelatedProducts(related || [])
    } catch (err) {
      console.error('Product load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    setCartError(null)
    
    if (!selectedSize) {
      setCartError('Please select a size')
      return
    }

    if (!product) return

    const availableStock = product.stock
    if (quantity > availableStock) {
      setCartError(`Only ${availableStock} item(s) available in stock`)
      return
    }

    setAddingToCart(true)
    try {
      const result = await addToCart(product.id, selectedSize, selectedColor, quantity, product)
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to add to cart')
      }
      navigate('/cart')
    } catch (err) {
      setCartError(err.message)
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="container">
          <LoadingSpinner size="lg" text="Loading product..." />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="container">
          <ErrorMessage title="Product Not Found" message={error || 'This product is no longer available.'} showHomeLink />
        </div>
      </div>
    )
  }

  const { original, discounted, hasDiscount, savings, discountPercent } = formatPrice(product.price, product.discount_price)
  const baseImages = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop']
  const images = Array.from({ length: 4 }, (_, i) => baseImages[i % baseImages.length])
  const isInStock = product.stock > 0 && product.is_active

  return (
    <div className="product-details-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
        </nav>

        <div className="product-details__grid">
          <div className="product-details__images">
            <div className="product-details__thumbnail-list">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`product-details__thumbnail ${activeImage === index ? 'active' : ''}`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
            <div className="product-details__main-image">
              <img src={images[activeImage]} alt={`${product.name} selected view`} className="product-details__hero-image" />
            </div>
          </div>

          <div className="product-details__info">
            <span className="product-details__brand">{product.brand}</span>
            <h1 className="product-details__name">{product.name}</h1>
            <p className="product-details__description">{product.description}</p>

            <div className="product-details__pricing">
              <span className="product-details__current-price">{discounted || original}</span>
              {hasDiscount && (
                <>
                  <span className="product-details__original-price">{original}</span>
                  <span className="product-details__discount">Save {savings} ({discountPercent}% off)</span>
                </>
              )}
              <span className={`product-details__stock ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                {isInStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            <form onSubmit={handleAddToCart} className="product-details__form">
              <div className="form-group">
                <label htmlFor="product-size" className="form-label">Select Size</label>
                <div className="size-selector">
                  {product.sizes.map(size => (
                    <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`size-btn ${selectedSize === size ? 'active' : ''} ${!isInStock ? 'disabled' : ''}`} disabled={!isInStock} aria-pressed={selectedSize === size}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {product.colors && product.colors.length > 1 && (
                <div className="form-group">
                  <label htmlFor="product-color" className="form-label">Select Color</label>
                  <div className="color-selector">
                    {product.colors.map(color => (
                      <button key={color} type="button" onClick={() => setSelectedColor(color)} className={`color-btn ${selectedColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} aria-label={`Select ${color} color`} />
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="product-quantity" className="form-label">Quantity</label>
                <div className="quantity-control">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1 || !isInStock}>−</button>
                  <input type="number" id="product-quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} min="1" max={product.stock} className="form-input quantity-input" disabled={!isInStock} />
                  <button type="button" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= product.stock || !isInStock}>+</button>
                </div>
              </div>

              {cartError && <div className="form-error" role="alert">{cartError}</div>}

              <button type="submit" className="btn btn--primary btn--large product-details__add-to-cart" disabled={!isInStock || !selectedSize || addingToCart}>
                {addingToCart ? 'Adding...' : isInStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </form>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="section related-products">
            <div className="container">
              <h2>You Might Also Like</h2>
              <div className="product-grid grid grid--4">
                {relatedProducts.map(prod => <ProductCard key={prod.id} product={prod} variant="default" />)}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductDetails