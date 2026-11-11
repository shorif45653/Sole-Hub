import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { formatCurrency } from '../utils/formatCurrency'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ToastNotification from '../components/ToastNotification'
import { cancelOrder } from '../services/orderService'

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    loadOrders()
  }, [user, authLoading, navigate])

  const loadOrders = async () => {
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      setOrders(data || [])
    } catch (err) {
      console.error('Orders load error:', err)
      setError(err.message || 'Failed to load orders')
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

  const paymentLabels = {
    PENDING: 'Pending',
    SUCCESS: 'Paid',
    FAILED: 'Failed',
    NOT_REQUIRED: 'Not Required'
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order? This action cannot be undone.')) return

    setCancellingId(orderId)
    setError(null)
    try {
      await cancelOrder(orderId)
      setToast({ message: 'Order cancelled successfully', type: 'success' })
      window.setTimeout(() => setToast(null), 3500)
      await loadOrders()
    } catch (err) {
      setError(err.message || 'Failed to cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="container">
          <LoadingSpinner size="lg" text="Loading orders..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-orders-page">
        <div className="container">
          <EmptyState type="default" title="Unable to Load Orders" description={error} actionLabel="Try Again" actionPath="/" />
        </div>
      </div>
    )
  }

  return (
    <div className="my-orders-page">
      <ToastNotification message={toast?.message} type={toast?.type} />
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>My Orders</span>
        </nav>

        <h1>My Orders</h1>
        <p>Track your purchases and order history.</p>

        {orders.length === 0 ? (
          <EmptyState
            type="orders"
            title="No Orders Yet"
            description="You haven't placed any orders. When you do, they'll appear here."
            actionLabel="Start Shopping"
            actionPath="/shop"
          />
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table" role="table" aria-label="Order history">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td>
                      <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <span className="order-items-count">{order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td>
                      <span className="order-total">{formatCurrency(order.total_amount)}</span>
                    </td>
                    <td>
                      <span className={`order-payment ${order.payment_status.toLowerCase()}`}>
                        {paymentLabels[order.payment_status] || order.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`order-status ${order.order_status.toLowerCase()}`}>
                        {statusLabels[order.order_status] || order.order_status}
                      </span>
                    </td>
                    <td>
                      {order.order_status === 'PLACED' && (
                        <button type="button" className="btn btn--danger btn--small order-cancel-button" onClick={() => handleCancelOrder(order.id)} disabled={cancellingId === order.id}>
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      <Link to={`/orders/${order.id}`} className="btn btn--outline btn--small">View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders