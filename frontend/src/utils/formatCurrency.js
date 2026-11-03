/**
 * Format currency in Indian Rupees
 * @param {number} amount - Amount in rupees
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const { showSymbol = true, compact = false } = options
  
  if (amount == null || isNaN(amount)) return showSymbol ? '₹0' : '0'
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: compact ? 0 : 2,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short'
  })
  
  return formatter.format(amount)
}

/**
 * Format price with original and discounted price
 * @param {number} price - Original price
 * @param {number|null} discountPrice - Discounted price
 * @returns {Object} Formatted price strings
 */
export const formatPrice = (price, discountPrice = null) => {
  const original = formatCurrency(price)
  if (!discountPrice || discountPrice >= price) {
    return { original, discounted: null, hasDiscount: false }
  }
  return {
    original,
    discounted: formatCurrency(discountPrice),
    hasDiscount: true,
    savings: formatCurrency(price - discountPrice),
    discountPercent: Math.round(((price - discountPrice) / price) * 100)
  }
}