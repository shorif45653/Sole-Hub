import { Link } from 'react-router-dom'
import { Diamond, Tag, Users, Footprints } from 'lucide-react'

const values = [
  { icon: Diamond, title: 'Quality First', text: 'Every shoe in our collection is carefully selected for comfort and durability.' },
  { icon: Tag, title: 'Fair Pricing', text: 'Competitive prices without compromising on quality.' },
  { icon: Users, title: 'Customer Focus', text: 'Your satisfaction is our priority. We are here to help.' }
]

const About = () => (
  <div className="about-page">
    <section className="about-hero">
      <div className="container about-hero__container">
        <div className="about-hero__content">
          <p className="eyebrow">OUR STORY</p>
          <h1>More than shoes.<br /><span>A way of life.</span></h1>
          <div className="about-hero__benefits">
            <div><Footprints size={28} /><strong>Curated styles</strong><small>For every journey</small></div>
            <div><Tag size={28} /><strong>Fair pricing</strong><small>Without compromising on quality</small></div>
            <div><Users size={28} /><strong>Everyday comfort</strong><small>Designed for real life</small></div>
          </div>
        </div>
        <div className="about-hero__image-wrap"><img src="/images/shoes_about1.png" alt="SoleHub lifestyle sneaker" /><div className="about-hero__tagline" aria-label="Find Your Sole. Own Your Style."><span>Find Your Sole.</span><span>Own Your Style.</span><i /></div></div>
      </div>
    </section>

    <section className="about-values container">
      <div className="about-values__header"><div><p className="eyebrow">OUR VALUES</p><h2>What We Stand For</h2></div><p>At SoleHub, our values guide everything we do — from the shoes we curate to the experience we create for our community.</p></div>
      <div className="about-values__grid">{values.map(({ icon: Icon, title, text }) => <article className="about-value-card" key={title}><div className="about-value-card__icon"><Icon size={32} /></div><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </section>

    <section className="about-mission container">
      <div className="about-mission__images"><img className="about-mission__image about-mission__image--main" src="/images/shoes_about2.png" alt="SoleHub sneaker lifestyle" /><img className="about-mission__image about-mission__image--detail" src="/images/shoes_about3.png" alt="SoleHub sneaker detail" /></div>
      <div className="about-mission__content"><p className="eyebrow">OUR MISSION</p><h2>Find your sole.<br /><span>Own your style.</span></h2><p>We believe the right pair can move more than your feet. It can move your confidence, your mood, and your everyday life.</p><Link to="/shop" className="btn btn--primary">Explore Collection <span aria-hidden="true">→</span></Link></div>
    </section>
  </div>
)

export default About

