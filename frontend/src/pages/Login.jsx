import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isValidEmail } from '../utils/validation'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { signIn, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const registrationMessage = location.state?.confirmationRequired
    ? `Account created. Please confirm ${location.state.email || 'your email address'} before logging in.`
    : location.state?.registered
      ? 'Account created successfully. You can now log in.'
      : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!email || !password) {
      setError('Please enter your email address and password')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const { data, error: authError } = await signIn(email.trim().toLowerCase(), password)
      if (authError) throw authError
      // If the authenticated user is an admin, land directly on the admin dashboard.
      // This avoids the extra click on the customer "Account" menu item.
      if (data?.user && (data.user.app_metadata?.role === 'admin' || data.user.user_metadata?.role === 'admin') || isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      const message = err.message === 'Email not confirmed'
        ? 'Please confirm your email address using the link sent by Supabase before logging in.'
        : err.message || 'Login failed. Please try again.'
      setError(message)
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
            <h1>Welcome Back</h1>
            <p>Sign in to your SoleHub account.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {registrationMessage && <div className="auth-success" role="status">{registrationMessage}</div>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <input
                type="email"
                id="login-email"
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
                autoComplete="current-password"
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>

            <button type="submit" className="btn btn--primary btn--large auth-form__submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>New to SoleHub? <Link to="/register" className="auth-footer__link">Create an account</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
