import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getFeaturedProducts } from '../services/productService'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import HeroCarousel from '../components/HeroCarousel'

const categories = [
  { name: 'Lifestyle', description: 'Everyday essentials', image: '/images/Air%20Max%20Pulse.jpg' },
  { name: 'Running', description: 'Built for every mile', image: '/images/WIND%20RAISER%20SHOES.jpg' },
  { name: 'Formal', description: 'Elegant dress shoes', image: '/images/Hush%20Puppies%20Black.png' },
  { name: 'Basketball', description: 'Court-ready performance', image: '/images/basketball.jpg' }
]

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToCart } = useCart()

  useEffect(() => {
    let mounted = true
    getFeaturedProducts(8)
      .then(products => mounted && setFeaturedProducts(products))
      .catch(err => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const handleQuickAdd = async product => {
    if (!product.sizes?.[0]) return
    await addToCart(product.id, product.sizes[0], product.colors?.[0] || null, 1, product)
  }

  if (loading) return <div className="homepage loading-page"><div className="empty-state"><LoadingSpinner size="lg" text="Loading homepage..." /></div></div>

  return (
    <div className="homepage">
      <div className="announcement-bar">NEW SEASON. NEW MOVES. EXPLORE THE LATEST DROPS.</div>
      <section className="hero hero--jordan" aria-label="SoleHub sneaker event">
        <div className="container hero__container">
          <div className="hero__content">
            <p className="eyebrow eyebrow--light">THE SOLE HUB SNEAKER EVENT</p>
            <h1 className="hero__headline">GRAB MIN. <span>30% OFF*</span></h1>
            <h2 className="hero__offer">AT OUR <strong>SOLE HUB</strong></h2>
            <div className="hero__cta">
              <Link to="/shop" className="btn btn--collection">Shop the collection <span aria-hidden="true">→</span></Link>
            </div>
            <p className="hero__fine-print">*On selected styles. While stocks last.</p>
          </div>
          <div className="hero__image">
            <HeroCarousel />
          </div>
        </div>
      </section>
      <section className="section categories-section" aria-label="Shop by category"><div className="container"><div className="section-header"><h2>WHAT ARE YOU LOOKING FOR?</h2></div><div className="category-grid">{categories.map(category => <Link key={category.name} to={`/shop?category=${encodeURIComponent(category.name)}`} className="category-card"><div className="category-card__image-wrapper"><img src={category.image} alt={category.name} className="category-card__image" loading="lazy" onError={(event) => { event.currentTarget.src = '/shoe-fallback.svg' }} /><div className="category-card__overlay" /></div><div className="category-card__content"><h3>{category.name}</h3><p>{category.description}</p></div></Link>)}</div></div></section>
      <section className="section featured-section" aria-label="Featured products"><div className="container"><div className="section-header section-header--with-action"><div><p className="eyebrow">THE LATEST</p><h2>FEATURED PICKS</h2></div><Link to="/shop" className="btn btn--outline">VIEW ALL SHOES</Link></div>{error ? <EmptyState type="default" title="Unable to load products" description={error} actionLabel="Try Again" actionPath="/" /> : featuredProducts.length ? <div className="product-grid grid grid--4">{featuredProducts.map(product => <ProductCard key={product.id} product={product} variant="featured" onQuickAdd={handleQuickAdd} />)}</div> : <EmptyState type="products" />}</div></section>
      <section className="promo-banner" aria-label="Promotional offer"><Link to="/shop" className="promo-banner__link" aria-label="Find your pair and shop all shoes"><img src="/images/Good%20Shoes,%20Good%20Days.png" alt="Good shoes, good days. Find your pair." className="promo-banner__shoe" loading="lazy" /></Link></section>
      <section className="section benefits-section" aria-label="Brand benefits"><div className="container"><div className="benefits-grid grid grid--3">{[{ title: 'Style That Moves', text: 'Footwear for everyday life.' }, { title: 'Comfort Comes First', text: 'Thoughtfully selected styles.' }, { title: 'Find Your Fit', text: 'Choose your size with confidence.' }].map(benefit => <div key={benefit.title} className="benefit-card"><h3>{benefit.title}</h3><p>{benefit.text}</p></div>)}</div></div></section>
    </div>
  )
}

export default Home




