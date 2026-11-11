import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { formatCurrency } from '../utils/formatCurrency'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

const OrderDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrder()
  }, [id, user])

  const loadOrder = async () => {
    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (id, name, brand, images)
          )
        `)
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      if (data.user_id !== user.id) {
        setError('You do not have access to this order')
        setLoading(false)
        return
      }

      setOrder(data)
    } catch (err) {
      console.error('Order load error:', err)
      setError(err.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const statusLabels = {
    PLACED: 'Placed',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  }

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="container">
          <LoadingSpinner size="lg" text="Loading order..." />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="container">
          <EmptyState type="default" title="Order Not Found" description={error || 'Unable to load order details.'} actionLabel="Back to Orders" actionPath="/my-orders" />
        </div>
      </div>
    )
  }

  return (
    <div className="order-details-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/my-orders">My Orders</Link>
          <span>/</span>
          <span>Order Details</span>
        </nav>

        <h1>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
        <p>Order placed on {new Date(order.created_at).toLocaleDateString()}</p>

        <div className="order-details-layout">
          <div className="order-details__items">
            <h2>Items Ordered</h2>
            <div className="order-items-list">
              {order.order_items.map(item => (
                <div key={item.id} className="order-item">
                  <div className="order-item__info">
                    <span className="order-item__name">{item.product_name}</span>
                    <span className="order-item__size">Size: {item.size}</span>
                    {item.color && <span className="order-item__color">Color: {item.color}</span>}
                    <span className="order-item__qty">×{item.quantity}</span>
                  </div>
                  <span className="order-item__price">{formatCurrency(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-details__summary">
            <div className="order-summary-card">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee)}</span>
              </div>
              <div className="summary-row">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
              <div className="summary-row summary-row--total">
                <span>Total Paid</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="summary-row">
                <span>Payment Method</span>
                <span>{order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}</span>
              </div>
              <div className="summary-row">
                <span>Payment Status</span>
                <span className={`status-badge ${order.payment_status.toLowerCase()}`}>
                  {order.payment_status}
                </span>
              </div>
              <div className="summary-row">
                <span>Order Status</span>
                <span className={`status-badge ${order.order_status.toLowerCase()}`}>
                  {statusLabels[order.order_status] || order.order_status}
                </span>
              </div>
            </div>

            <div className="order-shipping">
              <h3>Shipping Address</h3>
              <p>{order.shipping_full_name}</p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
              <p>{order.shipping_phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails