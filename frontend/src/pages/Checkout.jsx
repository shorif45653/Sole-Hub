import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatCurrency'
import { createOrder, generateIdempotencyKey } from '../services/orderService'
import { getAddresses } from '../services/addressService'
import LoadingSpinner from '../components/LoadingSpinner'
import ToastNotification from '../components/ToastNotification'

const Checkout = () => {
  const { user } = useAuth()
  const { items, clearCart, getCartTotals, validateCart } = useCart()
  const navigate = useNavigate()

  const { subtotal, shipping, total } = getCartTotals()
  const cartIssues = validateCart()

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    postal_code: ''
  })
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [toast, setToast] = useState(null)

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

  useEffect(() => {
    if (!user) return

    const loadSavedAddresses = async () => {
      setAddressesLoading(true)
      try {
        const addresses = await getAddresses(user.id)
        setSavedAddresses(addresses)

        if (addresses.length > 0) {
          const address = addresses.find(item => item.is_default) || addresses[0]
          setSelectedAddressId(address.id)
          setFormData({
            full_name: address.full_name || '',
            phone: address.phone || '',
            address_line: [address.address_line1, address.address_line2].filter(Boolean).join(', '),
            city: address.city || '',
            state: address.state || '',
            postal_code: address.postal_code || ''
          })
        } else {
          setShowAddressForm(true)
        }
      } catch (err) {
        setError(err.message || 'Unable to load saved addresses')
        setShowAddressForm(true)
      } finally {
        setAddressesLoading(false)
      }
    }

    loadSavedAddresses()
  }, [user])

  const selectAddress = (address) => {
    setSelectedAddressId(address.id)
    setShowAddressForm(false)
    setFormData({
      full_name: address.full_name || '',
      phone: address.phone || '',
      address_line: [address.address_line1, address.address_line2].filter(Boolean).join(', '),
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || ''
    })
    setError(null)
  }

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

      const orderId = data[0].order_id
      await clearCart()
      setOrderSuccess(orderId)
      setToast({ message: 'Order placed successfully', type: 'success' })
      window.setTimeout(() => setToast(null), 3500)
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="checkout-page">
      <ToastNotification message={toast?.message} type={toast?.type} />
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/cart">Cart</Link>
          <span>/</span>
          <span>Checkout</span>
        </nav>

        <h1>Checkout</h1>
        <p>Complete your order details below.</p>

        {orderSuccess ? (
          <div className="order-success" role="status">
            <h2>Order Placed Successfully</h2>
            <p>Thank you for your order. Your order has been saved and is now being processed.</p>
            <div className="order-success__actions">
              <Link to={`/orders/${orderSuccess}`} className="btn btn--primary">View Order</Link>
              <Link to="/my-orders" className="btn btn--outline">My Orders</Link>
            </div>
          </div>
        ) : (
        <>

        {error && <div className="checkout-error" role="alert">{error}</div>}

        <div className="checkout-layout">
          <div className="checkout-form">
            <form onSubmit={handleSubmit} className="checkout-form__inner">
              <h2>Delivery Details</h2>

              {addressesLoading ? (
                <LoadingSpinner />
              ) : savedAddresses.length > 0 && !showAddressForm ? (
                <div className="checkout-addresses">
                  <div className="checkout-addresses__list">
                    {savedAddresses.map(address => (
                      <button
                        key={address.id}
                        type="button"
                        className={`checkout-address-option ${selectedAddressId === address.id ? 'selected' : ''}`}
                        onClick={() => selectAddress(address)}
                      >
                        <strong>{address.label || 'Address'}{address.is_default ? ' · Default' : ''}</strong>
                        <span>{address.full_name}</span>
                        <span>{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}</span>
                        <span>{address.city}, {address.state} - {address.postal_code}</span>
                        <span>{address.phone}</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="checkout-change-address" onClick={() => setShowAddressForm(true)}>
                    Use a different address
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}

              <h2>Payment</h2>
              <div className="payment-methods">
                {[
                  { id: 'card', label: 'Card', description: 'Test card payment option.', icon: '💳' },
                  { id: 'upi', label: 'UPI', description: 'Test UPI payment option.', icon: '📱' },
                  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when your order is delivered.', icon: '🚚' }
                ].map(method => (
                  <label key={method.id} className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="visually-hidden"
                    />
                    <div className="payment-option__content">
                      <span className="payment-option__icon" aria-hidden="true">{method.icon}</span>
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
        </>
        )}
      </div>
    </div>
  )
}

export default Checkout