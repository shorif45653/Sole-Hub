import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const ErrorMessage = ({ 
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  showHomeLink = true
}) => {
  return (
    <div className="error-message" role="alert">
      <div className="error-message__icon" aria-hidden="true">
        <AlertCircle size={48} />
      </div>
      <h2 className="error-message__title">{title}</h2>
      <p className="error-message__text">{message}</p>
      <div className="error-message__actions">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="btn btn--primary"
            disabled={onRetry.loading}
          >
            {onRetry.loading ? (
              <>
                <svg className="loading-spinner loading-spinner--sm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                {retryLabel}
              </>
            )}
          </button>
        )}
        {showHomeLink && (
          <Link to="/" className="btn btn--outline">
            <ArrowLeft size={18} />
            Back Home
          </Link>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage