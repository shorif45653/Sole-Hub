import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import { createOrder, generateIdempotencyKey } from '../services/orderService'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

const Checkout = () => {
  const { user, signOut } = useAuth()
  const { items, clearCart, getCartTotals, validateCart } = useCart()
  const navigate = useNavigate()

  const { subtotal, shipping, total, itemCount } = getCartTotals()
  const cartIssues = validateCart()

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    postal_code: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (items.length === 0) {
      navigate('/cart')
      return
    }
    if (cartIssues.some(i => i.type === 'stock' || i.type === 'inactive')) {
      setError('Please fix cart issues before checkout')
    }
  }, [user, items, cartIssues, navigate])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.full_name || !formData.phone || !formData.address_line || !formData.city || !formData.state || !formData.postal_code) {
      setError('Please fill in all delivery details')
      return
    }

    if (cartIssues.some(i => i.type === 'stock' || i.type === 'inactive')) {
      setError('Please fix cart issues before checkout')
      return
    }

    setSubmitting(true)
    try {
      const idempotencyKey = generateIdempotencyKey()

      const data = await createOrder({
        p_user_id: user.id,
        p_shipping_full_name: formData.full_name,
        p_shipping_phone: formData.phone,
        p_shipping_address: formData.address_line,
        p_shipping_city: formData.city,
        p_shipping_state: formData.state,
        p_shipping_postal_code: formData.postal_code,
        p_payment_method: paymentMethod,
        p_idempotency_key: idempotencyKey
      })

      if (paymentMethod === 'cod') {
        navigate(`/orders/${data[0].order_id}`)
      } else {
        navigate(`/payment/${data[0].order_id}`)
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  const paymentMethods = [
    { id: 'card', label: 'Demo Card Payment', description: 'Simulated card payment (no real money charged)', icon: '💳' },
    { id: 'upi', label: 'Demo UPI Payment', description: 'Simulated UPI payment (no real money charged)', icon: '📱' },
    { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive your order', icon: '🚚' }
  ]

  return (
    <div className="checkout-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/cart">Cart</Link>
          <span>/</span>
          <span>Checkout</span>
        </nav>

        <div className="checkout__warning">
          <strong>DEMO CHECKOUT — NO REAL MONEY WILL BE CHARGED.</strong>
          <p>This is a simulated payment system for internship demonstration purposes only.</p>
        </div>

        <h1>Checkout</h1>
        <p>Complete your order details below.</p>

        {error && <div className="checkout-error" role="alert">{error}</div>}

        <div className="checkout-layout">
          <div className="checkout-form">
            <form onSubmit={handleSubmit} className="checkout-form__inner">
              <h2>Delivery Details</h2>
              
              <div className="form-group">
                <label htmlFor="full_name" className="form-label">Full Name <span className="text-orange" aria-hidden="true">*</span></label>
                <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} className="form-input" required />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number <span className="text-orange" aria-hidden="true">*</span></label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 XXXXX XXXXX" className="form-input" required />
              </div>

              <div className="form-group">
                <label htmlFor="address_line" className="form-label">Address Line <span className="text-orange" aria-hidden="true">*</span></label>
                <input type="text" id="address_line" name="address_line" value={formData.address_line} onChange={handleInputChange} className="form-input" required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">City <span className="text-orange" aria-hidden="true">*</span></label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="state" className="form-label">State <span className="text-orange" aria-hidden="true">*</span></label>
                  <input type="text" id="state" name="state" value={formData.state} onChange={handleInputChange} className="form-input" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="postal_code" className="form-label">Postal Code <span className="text-orange" aria-hidden="true">*</span></label>
                <input type="text" id="postal_code" name="postal_code" value={formData.postal_code} onChange={handleInputChange} placeholder="e.g. 110001" className="form-input" required />
              </div>

              <h2>Payment Method</h2>
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <label key={method.id} className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}>
                    <input type="radio" name="payment_method" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="visually-hidden" />
                    <div className="payment-option__content">
                      <span className="payment-option__icon">{method.icon}</span>
                      <div className="payment-option__info">
                        <strong>{method.label}</strong>
                        <p>{method.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button type="submit" className="btn btn--primary btn--large checkout-form__submit" disabled={submitting}>
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <div className="checkout-summary__card">
              <h2>Order Summary</h2>
              <div className="summary-items">
                {items.map(item => {
                  const product = item.products
                  const price = product ? (product.discount_price || product.price) : 0
                  return (
                    <div key={item.id} className="summary-item">
                      <div className="summary-item__info">
                        <span className="summary-item__name">{product?.name || 'Unknown Product'}</span>
                        <span className="summary-item__size">Size: {item.size}</span>
                        <span className="summary-item__qty">×{item.quantity}</span>
                      </div>
                      <span className="summary-item__price">{formatCurrency(price * item.quantity)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout