import { Outlet, Link, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Menu, X, LayoutDashboard, ShoppingBag, Users, Package, LogOut, ArrowUpRight } from 'lucide-react'

const AdminLayout = () => {
  const { user, signOut, isAdmin, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: ShoppingBag },
    { path: '/admin/orders', label: 'Orders', icon: Package },
    { path: '/admin/users', label: 'Customers', icon: Users },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) return null
  if (!isAdmin) return <Navigate to="/login" replace />

  return (
    <div className="admin-layout">
      <aside className={`admin-layout__sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-layout__brand">
          <Link to="/admin" className="admin-layout__brand-link">
            <span className="admin-layout__brand-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="48" fill="currentColor"/>
                <path d="M30 55 Q25 45 35 38 Q42 32 50 35 Q58 32 65 38 Q75 45 70 55 Q65 60 50 62 Q35 60 30 55" fill="#FF6238"/>
                <ellipse cx="42" cy="40" rx="4" ry="3" fill="#F8F5EF"/>
                <ellipse cx="58" cy="40" rx="4" ry="3" fill="#F8F5EF"/>
              </svg>
            </span>
            <span className="admin-layout__brand-text">SoleHub Admin</span>
          </Link>
        </div>
        
        <nav className="admin-layout__nav" role="navigation" aria-label="Admin navigation">
          {navItems.map(item => {
            const isActive = window.location.pathname === item.path
            return (
              <NavLink key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)} className={`admin-layout__nav-item ${isActive ? 'active' : ''}`}>
                <item.icon size={18} />
                <span>{item.label}</span>
                <ArrowUpRight size={15} className="admin-layout__nav-arrow" />
              </NavLink>
            )
          })}
        </nav>

        <div className="admin-layout__bottom">
          <button onClick={handleSignOut} className="admin-layout__nav-item admin-layout__nav-item--danger">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && <button className="admin-layout__backdrop" onClick={() => setIsSidebarOpen(false)} aria-label="Close admin menu" />}
      <div className="admin-layout__main">
        <header className="admin-layout__header">
          <button 
            className="admin-layout__sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div>
            <p className="admin-layout__eyebrow">SOLEHUB CONTROL CENTER</p>
            <h1 className="admin-layout__page-title">Admin Dashboard</h1>
          </div>
          <div className="admin-layout__user">
            <span className="admin-layout__user-avatar">{(profile?.full_name || user?.email || 'A').charAt(0).toUpperCase()}</span>
            <span><strong>{profile?.full_name || 'Administrator'}</strong><small>{user?.email}</small></span>
          </div>
        </header>

        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout