import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Package, ShoppingBag, Users, ClipboardList, CircleDollarSign, Clock3 } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { formatCurrency } from '../../utils/formatCurrency'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    successfulPayments: 0,
    totalOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [
        { count: totalProducts },
        { count: activeProducts },
        { count: totalCustomers },
        { count: totalOrders },
        { count: pendingOrders },
        { count: successfulPayments },
        { data: ordersData }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PLACED'),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'SUCCESS'),
        supabase.from('orders').select('total_amount').eq('payment_status', 'SUCCESS')
      ])

      const totalOrderValue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

      setStats({
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalCustomers: totalCustomers || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        successfulPayments: successfulPayments || 0,
        totalOrderValue
      })
    } catch (err) {
      console.error('Dashboard stats error:', err)
      setError(err.message || 'Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="container">
          <EmptyState type="default" title="Unable to Load Dashboard" description={error} actionLabel="Try Again" actionPath="/" />
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-dashboard__intro">
          <div><p className="eyebrow">OVERVIEW</p><h2>Good to see you, admin.</h2><p>Track your store performance and manage your catalog from one place.</p></div>
          <Link to="/admin/products/add" className="btn btn--primary">Add New Product <ArrowUpRight size={17} /></Link>
        </div>

        <div className="admin-stats-grid">
          <div className="stat-card stat-card--orange">
            <Package size={22} />
            <div className="stat-card__value">{stats.totalProducts}</div>
            <div className="stat-card__label">Total Products</div>
          </div>
          <div className="stat-card stat-card--blue"><ShoppingBag size={22} />
            <div className="stat-card__value">{stats.activeProducts}</div>
            <div className="stat-card__label">Active Products</div>
          </div>
          <div className="stat-card stat-card--purple"><Users size={22} />
            <div className="stat-card__value">{stats.totalCustomers}</div>
            <div className="stat-card__label">Registered Customers</div>
          </div>
          <div className="stat-card stat-card--green"><ClipboardList size={22} />
            <div className="stat-card__value">{stats.totalOrders}</div>
            <div className="stat-card__label">Total Orders</div>
          </div>
          <div className="stat-card"><Clock3 size={22} />
            <div className="stat-card__value">{stats.pendingOrders}</div>
            <div className="stat-card__label">Pending Orders</div>
          </div>
          <div className="stat-card"><CircleDollarSign size={22} />
            <div className="stat-card__value">{stats.successfulPayments}</div>
            <div className="stat-card__label">Successful Payments</div>
          </div>
          <div className="stat-card stat-card--revenue"><CircleDollarSign size={22} />
            <div className="stat-card__value">{formatCurrency(stats.totalOrderValue)}</div>
            <div className="stat-card__label">Total Order Value</div>
          </div>
        </div>

        <div className="admin-quick-actions">
          <div className="admin-section-heading"><div><p className="eyebrow">SHORTCUTS</p><h2>Quick Actions</h2></div></div>
          <div className="quick-actions-grid">
            <Link to="/admin/products" className="btn btn--primary btn--large">
              Manage Products
            </Link>
            <Link to="/admin/orders" className="btn btn--outline btn--large">
              View Orders
            </Link>
            <Link to="/admin/users" className="btn btn--outline btn--large">
              Manage Customers
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard