import { ShoppingBag, User, Search, Menu, X, Home as HomeIcon, Store, Info, LayoutDashboard } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'

const Navbar = () => {
  const location = useLocation()
  const { user, isAdmin } = useAuth()
  const { getCartTotals } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { itemCount: cartCount } = getCartTotals()
  const navLinks = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/shop', label: 'Shop', icon: Store },
    { path: '/about', label: 'About', icon: Info },
    { path: '/cart', label: 'Cart', icon: ShoppingBag }
  ]

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setIsMenuOpen(false)
  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="SoleHub Home">
          <img src="/images/solehub-logo.png" alt="SoleHub" className="brand-logo brand-logo--navbar" />
        </Link>
        <nav className="navbar__nav desktop-only">
          <ul className="navbar__list">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link to={link.path} className={`navbar__link ${location.pathname === link.path ? 'active' : ''}`}>
                  <link.icon size={17} strokeWidth={2} aria-hidden="true" />
                  {link.label}
                  {link.path === '/cart' && cartCount > 0 && <span className="navbar__nav-cart-count">{cartCount > 99 ? '99+' : cartCount}</span>}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop" className="navbar__link navbar__search-link" aria-label="Search products">
                <Search size={17} strokeWidth={2} aria-hidden="true" />
                Search
              </Link>
            </li>
          </ul>
        </nav>
        <div className="navbar__actions desktop-only">
          {user ? (
            <>
              <Link to={isAdmin ? '/admin' : '/account'} className="navbar__action-btn" aria-label={isAdmin ? 'Admin dashboard' : 'Account'} title={isAdmin ? 'Admin dashboard' : 'Account'}>
                {isAdmin ? <LayoutDashboard size={20} /> : <User size={20} />}
              </Link>
            </>
          ) : (
            <Link to="/login" className="navbar__login-btn" aria-label="Login">
              <User size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
        <button className="navbar__menu-btn mobile-only" onClick={() => setIsMenuOpen(open => !open)} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMenuOpen && (
        <nav id="mobile-menu" className="navbar__mobile-menu">
          <ul>
            {navLinks.map(link => (
              <li key={link.path}>
                <Link to={link.path} onClick={closeMenu} className="navbar__mobile-link">
                  <link.icon size={18} strokeWidth={2} aria-hidden="true" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={user ? (isAdmin ? '/admin' : '/account') : '/login'} onClick={closeMenu}>{user ? (isAdmin ? 'Admin Dashboard' : 'My Account') : 'Sign In'}</Link>
        </nav>
      )}
    </header>
  )
}

export default Navbar
