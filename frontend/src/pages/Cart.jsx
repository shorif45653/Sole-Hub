import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

const Cart = () => {
  const { items, loading, updateQuantity, removeFromCart, clearCart, getCartTotals, validateCart } = useCart()
  const navigate = useNavigate()
  const [cartIssues, setCartIssues] = useState([])

  const { subtotal, shipping, total, itemCount } = getCartTotals()

  useEffect(() => {
    const issues = validateCart()
    setCartIssues(issues)
  }, [items, validateCart])

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <LoadingSpinner size="lg" text="Loading cart..." />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <EmptyState type="cart" title="Your Cart is Empty" description="Looks like you haven't added any shoes yet. Time to find your perfect pair!" actionLabel="Start Shopping" actionPath="/shop" />
        </div>
      </div>
    )
  }

  const validItems = items.filter(item => item.products && item.products.is_active)

  return (
    <div className="cart-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Cart</span>
        </nav>

        <h1>Your Shopping Cart</h1>
        <p>Review your items before checkout.</p>

        {cartIssues.length > 0 && (
          <div className="cart-issues">
            {cartIssues.map((issue, index) => (
              <div key={index} className="cart-issue cart-issue--warning">
                <strong>{issue.message}</strong>
                {issue.type === 'stock' && (
                  <button onClick={() => updateQuantity(issue.item.id, issue.item.products.stock)} className="btn btn--outline btn--small">
                    Adjust to {issue.item.products.stock}
                  </button>
                )}
                {(issue.type === 'removed' || issue.type === 'inactive') && (
                  <button onClick={() => removeFromCart(issue.item.id)} className="btn btn--outline btn--small">
                    Remove Item
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="cart-layout">
          <div className="cart-items">
            {validItems.map(item => {
              const product = item.products
              const price = product.discount_price || product.price
              const image = product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop'
              
              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__image">
                    <img src={image} alt={product.name} className="cart-item__image-img" loading="lazy" />
                  </div>
                  <div className="cart-item__details">
                    <Link to={`/product/${product.id}`} className="cart-item__name">{product.name}</Link>
                    <p className="cart-item__brand">{product.brand}</p>
                    <p className="cart-item__size">Size: {item.size}</p>
                    {item.color && <p className="cart-item__color">Color: {item.color}</p>}
                  </div>
                  <div className="cart-item__controls">
                    <div className="cart-item__price">{formatCurrency(price)}</div>
                    <div className="cart-item__quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="btn btn--outline btn--small">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= (product.stock || 99)} className="btn btn--outline btn--small">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="cart-item__remove" aria-label={`Remove ${product.name} from cart`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="cart-summary">
            <div className="cart-summary__card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
              </div>
              <div className="summary-row summary-row--total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn btn--primary btn--large cart-summary__checkout" disabled={cartIssues.some(i => i.type === 'stock' || i.type === 'inactive')}>
                Proceed to Checkout
              </button>
              <button onClick={clearCart} className="btn btn--ghost cart-summary__clear">
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart