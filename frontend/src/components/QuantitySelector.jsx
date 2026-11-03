const QuantitySelector = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 99,
  disabled = false,
  ariaLabel = 'Quantity'
}) => {
  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(value + 1)
    }
  }

  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(value - 1)
    }
  }

  const handleInputChange = (e) => {
    if (disabled) return
    const newValue = parseInt(e.target.value, 10)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  const handleBlur = (e) => {
    if (disabled) return
    const newValue = parseInt(e.target.value, 10)
    if (isNaN(newValue) || newValue < min) {
      onChange(min)
    } else if (newValue > max) {
      onChange(max)
    }
  }

  return (
    <div className="quantity-selector" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className="quantity-selector__btn"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        aria-disabled={disabled || value <= min}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        className="quantity-selector__input"
        disabled={disabled}
        aria-label={ariaLabel}
        inputMode="numeric"
      />
      <button
        type="button"
        className="quantity-selector__btn"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        aria-disabled={disabled || value >= max}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}

export default QuantitySelector