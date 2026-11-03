import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { formatCurrency } from '../../utils/formatCurrency'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [filterStatus])

  const loadOrders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles (full_name, email),
          order_items (id, quantity)
        `)
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('order_status', filterStatus)
      }

      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      setOrders(data || [])
    } catch (err) {
      console.error('Orders load error:', err)
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (updateError) throw updateError
      loadOrders()
    } catch (err) {
      setError(err.message || 'Failed to update order status')
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
      <div className="admin-page">
        <div className="container">
          <LoadingSpinner size="lg" text="Loading orders..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="container">
          <EmptyState type="default" title="Unable to Load Orders" description={error} actionLabel="Try Again" actionPath="/" />
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page-header">
          <h1>Orders</h1>
        </div>

        <div className="admin-filters">
          <label htmlFor="status-filter" className="form-label">Filter by Status</label>
          <select id="status-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-select form-select--small">
            <option value="all">All Orders</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        {orders.length === 0 ? (
          <EmptyState type="orders" title="No Orders" description="No orders found matching your criteria." actionLabel="View All" actionPath="/admin/orders" />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table" role="table" aria-label="Order management">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td>
                      <span>{order.profiles?.full_name || 'Unknown'}</span>
                      <br />
                      <span className="text-gray">{order.profiles?.email || ''}</span>
                    </td>
                    <td>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <span>{order.order_items?.length || 0} items</span>
                    </td>
                    <td>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${order.payment_status.toLowerCase()}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.order_status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="form-select form-select--small"
                      >
                        {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="btn btn--outline btn--small">View</Link>
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

export default AdminOrders