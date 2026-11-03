import { ChevronRight, CircleUserRound, Clock3, Heart, Info, MapPin, Package, RefreshCcw, ShieldCheck, Headphones, ArrowLeftRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Account = () => {
  const { user, profile, signOut, loading, isAdmin } = useAuth()
  const navigate = useNavigate()
  if (loading) return <div className="account-page account-page--loading">Loading account...</div>
  if (isAdmin) {
    navigate('/admin', { replace: true })
    return null
  }
  const name = profile?.full_name || user?.user_metadata?.full_name || 'SoleHub Customer'
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
  const accountItems = [{ label: 'Profile', icon: CircleUserRound, to: '/account/profile' }, { label: 'Addresses', icon: MapPin, to: '/account/addresses' }, { label: 'Wishlist', icon: Heart, to: '/account/wishlist' }, { label: 'Order History', icon: Clock3, to: '/my-orders' }]
  const moreItems = [{ label: 'Support', icon: Headphones, to: '/contact' }, { label: 'Privacy Policy', icon: ShieldCheck, to: '/privacy' }, { label: 'Refund Policy', icon: RefreshCcw, to: '/refund-policy' }, { label: 'Track Order', icon: Package, to: '/track-order' }, { label: 'Refund & Exchange', icon: ArrowLeftRight, to: '/refund-exchange' }, { label: 'About Us', icon: Info, to: '/about' }]
  const handleLogout = async () => { const result = await signOut(); if (!result.error) navigate('/', { replace: true }) }
  const renderItems = items => items.map(item => <Link key={item.label} to={item.to} className="account-menu__row"><item.icon size={24} strokeWidth={1.8} /><span>{item.label}</span><ChevronRight size={24} strokeWidth={1.6} /></Link>)
  return <div className="account-page"><section className="account-hero"><div className="account-hero__pattern" /><div className="account-hero__content"><img src="/images/solehub-logo.png" alt="SoleHub" className="account-hero__logo" />{user ? <><div className="account-avatar">{initials}</div><p className="account-hero__eyebrow">WELCOME BACK</p><h1>{name}</h1></> : <><p className="account-hero__eyebrow">WELCOME TO</p><h1>SoleHub</h1></>}</div></section><div className={`account-panel ${!user ? 'account-panel--guest' : ''}`}>{user ? <><section className="account-menu-section"><h2>ACCOUNT</h2>{renderItems(accountItems)}</section><section className="account-menu-section"><h2>MORE</h2>{renderItems(moreItems)}</section><button type="button" onClick={handleLogout} className="account-logout">Log Out</button></> : <div className="account-login-card"><h2>ACCOUNT</h2><p>Sign in to manage your profile, orders, and saved details.</p><Link to="/login" className="btn btn--primary btn--large">Login</Link><p className="account-login-card__signup">New to SoleHub? <Link to="/register">Create an account</Link></p></div>}</div></div>
}
export default Account