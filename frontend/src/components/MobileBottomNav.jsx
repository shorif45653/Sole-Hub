import { Home, Store, LayoutGrid, ShoppingBag, UserRound, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'




import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'



const MobileBottomNav = () => {
  const location = useLocation()
  const { user, isAdmin } = useAuth()
  const { getCartTotals } = useCart()
  const { itemCount } = getCartTotals()
  const customerLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Store },
    { label: 'Categories', path: '/shop', icon: LayoutGrid },
    { label: 'Cart', path: '/cart', icon: ShoppingBag },
  ]
  const adminLinks = user && isAdmin ? [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard }] : []
  const accountLink = user && !isAdmin ? [{ label: 'Account', path: '/account', icon: UserRound }] : []
  const allLinks = [...customerLinks, ...adminLinks, ...accountLink]
  return <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{allLinks.map(({ label, path, icon: Icon }) => <Link key={label} to={path} className={location.pathname === path || (label === 'Categories' && location.pathname === "/shop") ? 'active' : ''}>
          <span className="mobile-bottom-nav__icon"><Icon size={23} strokeWidth={1.8} />{label === 'Cart' && itemCount > 0 && <b>{itemCount > 99 ? '99+' : itemCount}</b>}</span><span>{label}</span></Link>)}</nav>
}
export default MobileBottomNav
