import { Link } from 'react-router-dom'

const NotFound = () => (
  <div className="not-found-page">
    <div className="container">
      <div className="empty-state">
        <div className="empty-state__icon" style={{ fontSize: '80px' }}>404</div>
        <h1 className="empty-state__title">Page Not Found</h1>
        <p className="empty-state__text">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn--primary">Go Home</Link>
      </div>
    </div>
  </div>
)

export default NotFound