const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'loading-spinner--sm',
    md: 'loading-spinner--md',
    lg: 'loading-spinner--lg'
  }

  const sizes = {
    sm: { width: '24px', height: '24px', borderWidth: '2px' },
    md: { width: '40px', height: '40px', borderWidth: '3px' },
    lg: { width: '56px', height: '56px', borderWidth: '4px' }
  }

  const style = sizes[size]

  return (
    <div className="loading-spinner-container" role="status" aria-live="polite">
      <div 
        className={`loading-spinner ${sizeClasses[size]}`}
        style={style}
        aria-hidden="true"
      />
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  )
}

export default LoadingSpinner