import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Plus } from 'lucide-react'
import { formatPrice } from '../utils/formatCurrency'
import { useWishlist } from '../context/WishlistContext'

const ProductCard = ({ 
  product, 
  variant = 'default',
  onQuickAdd 
}) => {
  const { original, discounted, hasDiscount, discountPercent } = formatPrice(
    product.price, 
    product.discount_price
  )

  const imageUrl = product.images?.[0] || '/shoe-fallback.svg'
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(product.id)

  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isBestseller = product.is_bestseller || false

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickAdd) onQuickAdd(product)
  }

  if (variant === 'featured') {
    return (
      <article className="product-card product-card--featured">
        <Link to={`/product/${product.id}`} className="product-card__link" aria-label={`View ${product.name}`}>
          <div className="product-card__image-wrapper">
            <img 
              src={imageUrl} 
              alt={product.name}
              className="product-card__image"
              loading="lazy"
              onError={(event) => { event.currentTarget.src = '/shoe-fallback.svg' }}
            />
            {(isNew || isBestseller) && (
              <div className="product-card__badges">
                {isNew && <span className="badge badge--new">NEW</span>}
                {isBestseller && <span className="badge badge--bestseller">BESTSELLER</span>}
              </div>
            )}
            {hasDiscount && (
              <span className="product-card__sale-badge">-{discountPercent}%</span>
            )}
          </div>
          <div className="product-card__content">
            <p className="product-card__brand">{product.brand}</p>
            <h3 className="product-card__name">{product.name}</h3>
            <div className="product-card__price">
              <span className="product-card__current-price">{discounted || original}</span>
              {hasDiscount && (
                <span className="product-card__original-price">{original}</span>
              )}
            </div>
          </div>
        </Link>
        <button
          className="product-card__quick-add"
          onClick={handleQuickAdd}
          aria-label={`Quick add ${product.name} to cart`}
        >
          <Plus size={18} />
        </button>
      </article>
    )
  }

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__link" aria-label={`View ${product.name}`}>
        <div className="product-card__image-wrapper">
          <img 
            src={imageUrl} 
            alt={product.name}
            className="product-card__image"
              loading="lazy"
              onError={(event) => { event.currentTarget.src = '/shoe-fallback.svg' }}
          />
          {(isNew || isBestseller) && (
            <div className="product-card__badges">
              {isNew && <span className="badge badge--new">NEW</span>}
              {isBestseller && <span className="badge badge--bestseller">BESTSELLER</span>}
            </div>
          )}
          {hasDiscount && (
            <span className="product-card__sale-badge">-{discountPercent}%</span>
          )}
        </div>
        <div className="product-card__content">
          <p className="product-card__brand">{product.brand}</p>
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__price">
            <span className="product-card__current-price">{discounted || original}</span>
            {hasDiscount && (
              <span className="product-card__original-price">{original}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="product-card__actions">
        <button
          className="btn btn--outline btn--small product-card__add-btn"
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag size={16} />
          <span>Add to Cart</span>
        </button>
        <button
          className={`product-card__wishlist ${wishlisted ? 'active' : ''}`}
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleWishlist(product) }}
          aria-label={`${wishlisted ? 'Remove' : 'Add'} ${product.name} ${wishlisted ? 'from' : 'to'} wishlist`}
          aria-pressed={wishlisted}
        >
          <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  )
}

export default ProductCard
