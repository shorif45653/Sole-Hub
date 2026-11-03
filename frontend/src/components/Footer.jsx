import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { label: 'All Shoes', path: '/shop' },
      { label: 'New Arrivals', path: '/shop?sort=newest' },
      { label: 'Lifestyle', path: '/shop?category=Lifestyle' },
      { label: 'Running', path: '/shop?category=Running' },
      { label: 'Formal', path: '/shop?category=Formal' },
      { label: 'Basketball', path: '/shop?category=Basketball' },
    ],
    support: [
      { label: 'Contact Us', path: '/contact' },
      { label: 'Shipping Info', path: '/shipping' },
      { label: 'Returns & Exchanges', path: '/returns' },
      { label: 'Size Guide', path: '/size-guide' },
      { label: 'Track Order', path: '/track-order' },
    ],
    about: [
      { label: 'Our Story', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Press', path: '/press' },
      { label: 'Sustainability', path: '/sustainability' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
    ]
  }

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo" aria-label="SoleHub Home">
              <img src="/images/solehub-logo.png" alt="SoleHub" className="brand-logo brand-logo--footer" />
            </Link>
            <p className="footer__tagline">Find Your Sole. Own Your Style.</p>
            <p className="footer__description">
              Independent footwear brand curating the best sneakers and shoes for every step of your journey.
            </p>
          </div>

          {/* Shop Links */}
          <nav className="footer__section" aria-label="Shop">
            <h3 className="footer__heading">Shop</h3>
            <ul className="footer__links">
              {footerLinks.shop.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support Links */}
          <nav className="footer__section" aria-label="Customer Support">
            <h3 className="footer__heading">Support</h3>
            <ul className="footer__links">
              {footerLinks.support.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* About Links */}
          <nav className="footer__section" aria-label="About SoleHub">
            <h3 className="footer__heading">About</h3>
            <ul className="footer__links">
              {footerLinks.about.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="footer__section footer__newsletter">
            <h3 className="footer__heading">Stay Updated</h3>
            <p className="footer__newsletter-text">Get early access to new drops and exclusive offers.</p>
            <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="newsletter-email" className="visually-hidden">Email address</label>
              <input
                type="email"
                id="newsletter-email"
                placeholder="Enter your email"
                className="footer__newsletter-input"
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="btn btn--primary btn--small">
                Subscribe
              </button>
            </form>
            <p className="footer__newsletter-note">No spam. Unsubscribe anytime.</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <div className="footer__legal">
            <p className="footer__copyright">
              &copy; {currentYear} SoleHub. All rights reserved.
            </p>
            <p className="footer__demo-notice">
              This is a demo project for internship demonstration purposes.
            </p>
          </div>
          <nav className="footer__legal-links" aria-label="Legal">
            {footerLinks.legal.map(link => (
              <Link key={link.path} to={link.path} className="footer__legal-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer
