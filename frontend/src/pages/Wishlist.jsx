import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { formatPrice } from '../utils/formatCurrency'
import EmptyState from '../components/EmptyState'

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist()

  if (items.length === 0) {
    return <div className="wishlist-page"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/account">Account</Link><span>/</span><span>Wishlist</span></nav><EmptyState type="wishlist" /></div></div>
  }

  return <div className="wishlist-page"><div className="container"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/account">Account</Link><span>/</span><span>Wishlist</span></nav><div className="wishlist-header"><div><p className="eyebrow">SAVED FOR LATER</p><h1>Wishlist</h1></div><span>{items.length} item{items.length !== 1 ? 's' : ''}</span></div><div className="wishlist-grid">{items.map(product => { const { original, discounted } = formatPrice(product.price, product.discount_price); return <article key={product.id} className="wishlist-card"><Link to={`/product/${product.id}`}><img src={product.images?.[0] || '/shoe-fallback.svg'} alt={product.name} /><p className="product-card__brand">{product.brand}</p><h2>{product.name}</h2><p className="wishlist-card__price">{discounted || original}</p></Link><div className="wishlist-card__actions"><Link to={`/product/${product.id}`} className="btn btn--outline btn--small">View Product</Link><button type="button" onClick={() => removeFromWishlist(product.id)} aria-label={`Remove ${product.name} from wishlist`}><Trash2 size={18} /></button></div></article> })}</div></div></div>
}

export default Wishlist