import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isValidEmail, isValidPhone, validatePassword } from '../utils/validation'

const Register = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (!isValidEmail(email)) {
      setError('Enter a valid email address')
      return
    }

    if (!isValidPhone(phone)) {
      setError('Enter a valid Indian mobile number')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0])
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await signUp(email.trim().toLowerCase(), password, fullName, phone)
      if (authError) throw authError
      navigate('/login', { state: { registered: true, confirmationRequired: !data?.session, email: email.trim().toLowerCase() } })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <img src="/images/solehub-logo.png" alt="SoleHub" className="brand-logo brand-logo--auth" />
            </Link>
            <h1>Create Account</h1>
            <p>Join SoleHub and start your sneaker journey today.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="form-input"
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email" className="form-label">Email Address</label>
              <input
                type="email"
                id="register-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                autoComplete="new-password"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              <p className="form-hint">At least 8 characters, with uppercase, lowercase, and a number</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                autoComplete="new-password"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(value => !value)} aria-label="Toggle confirmation password visibility">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Mobile Number <span className="text-orange" aria-hidden="true">*</span></label>
              <div className="phone-input">
                <span>+91</span>
                <input id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="9876543210" required />
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--large auth-form__submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-footer__link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register