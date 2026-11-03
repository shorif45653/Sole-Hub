import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isValidPhone } from '../utils/validation'

const Profile = () => {
  const { user, profile, updateProfile } = useAuth()
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [status, setStatus] = useState(null)
  useEffect(() => setForm({ full_name: profile?.full_name || '', phone: profile?.phone?.replace('+91', '') || '' }), [profile])
  const submit = async event => {
    event.preventDefault(); setStatus(null)
    if (!form.full_name.trim()) return setStatus({ type: 'error', text: 'Full name is required.' })
    if (form.phone && !isValidPhone(form.phone)) return setStatus({ type: 'error', text: 'Enter a valid Indian mobile number.' })
    const { error } = await updateProfile({ full_name: form.full_name.trim(), phone: form.phone || null })
    setStatus(error ? { type: 'error', text: error.message } : { type: 'success', text: 'Profile updated successfully.' })
  }
  return <div className="account-subpage"><div className="container"><Link to="/account" className="account-subpage__back">← Back to Account</Link><div className="account-subpage__card"><p className="eyebrow">SOLEHUB ACCOUNT</p><h1>Profile</h1><p className="text-gray">Update the details linked to your SoleHub account.</p>{status && <div className={status.type === 'error' ? 'auth-error' : 'account-success'} role="status">{status.text}</div>}<form onSubmit={submit} className="auth-form"><div className="form-group"><label className="form-label" htmlFor="profile-name">Full Name</label><input className="form-input" id="profile-name" value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })} autoComplete="name" required /></div><div className="form-group"><label className="form-label" htmlFor="profile-phone">Mobile Number <span className="text-gray">(optional)</span></label><div className="phone-input"><span>+91</span><input id="profile-phone" type="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} autoComplete="tel" /></div></div><p className="form-hint">Signed in as {user?.email || 'your email address'}.</p><button className="btn btn--primary btn--large" type="submit">Save Changes</button></form></div></div></div>
}
export default Profile