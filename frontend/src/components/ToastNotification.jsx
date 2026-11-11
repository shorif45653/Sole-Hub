const ToastNotification = ({ message, type = 'success' }) => {
  if (!message) return null

  return (
    <div className={`toast-notification toast-notification--${type}`} role="status" aria-live="polite">
      <span className="toast-notification__icon" aria-hidden="true">✓</span>
      <span>{message}</span>
    </div>
  )
}

export default ToastNotification