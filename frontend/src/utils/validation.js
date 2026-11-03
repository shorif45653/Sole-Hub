/**
 * Validation utilities for forms
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = []
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  return { isValid: errors.length === 0, errors }
}

/**
 * Validate required field
 * @param {string} value
 * @param {string} fieldName
 * @returns {string|null} Error message or null
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validate phone number (Indian format)
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+91[\-\s]?)?[0]?[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const normalizeIndianPhone = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '')
  const localDigits = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits
  return `+91${localDigits}`
}

/**
 * Validate postal code (Indian PIN)
 * @param {string} pincode
 * @returns {boolean}
 */
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/
  return pincodeRegex.test(pincode)
}

/**
 * Validate positive integer
 * @param {number|string} value
 * @returns {boolean}
 */
export const isPositiveInteger = (value) => {
  const num = Number(value)
  return Number.isInteger(num) && num > 0
}

/**
 * Validate non-negative integer
 * @param {number|string} value
 * @returns {boolean}
 */
export const isNonNegativeInteger = (value) => {
  const num = Number(value)
  return Number.isInteger(num) && num >= 0
}

/**
 * Validate price (positive number with up to 2 decimals)
 * @param {number|string} value
 * @returns {boolean}
 */
export const isValidPrice = (value) => {
  const num = Number(value)
  return !isNaN(num) && num >= 0 && num <= 999999.99
}

/**
 * Sanitize string input
 * @param {string} str
 * @returns {string}
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return ''
  return str.trim().replace(/[<>]/g, '')
}

// UUID v4 generator with crypto.randomUUID fallback
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Generate unique ID
 * @returns {string}
 */
export const generateId = generateUUID

// Export for use in other modules
export { generateUUID }

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}