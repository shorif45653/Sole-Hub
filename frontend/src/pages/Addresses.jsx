import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../services/addressService'
import { isValidPhone, isValidPincode } from '../utils/validation'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

const emptyForm = {
  label: 'Home',
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  is_default: false
}

const Addresses = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    loadAddresses()
  }, [authLoading, user])

  const loadAddresses = async () => {
    setLoading(true)
    try {
      const data = await getAddresses(user.id)
      setAddresses(data)
    } catch (err) {
      console.error('Addresses load error:', err)
      setError(err.message || 'Failed to load addresses')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const startAdd = () => {
    setStatus(null)
    setError(null)
    setEditingId(null)
    setForm({
      ...emptyForm,
      full_name: profile?.full_name || '',
      phone: profile?.phone?.replace('+91', '') || '',
      is_default: addresses.length === 0
    })
    setShowForm(true)
  }

  const startEdit = (address) => {
    setStatus(null)
    setError(null)
    setEditingId(address.id)
    setForm({
      label: address.label || 'Home',
      full_name: address.full_name || '',
      phone: address.phone?.replace('+91', '') || '',
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || 'India',
      is_default: Boolean(address.is_default)
    })
    setShowForm(true)
  }

  const validateForm = () => {
    if (!form.full_name.trim()) return 'Full name is required.'
    if (!form.phone.trim()) return 'Mobile number is required.'
    if (!isValidPhone(form.phone)) return 'Enter a valid Indian mobile number.'
    if (!form.address_line1.trim()) return 'Address is required.'
    if (!form.city.trim()) return 'City is required.'
    if (!form.state.trim()) return 'State is required.'
    if (!isValidPincode(form.postal_code.trim())) return 'Enter a valid 6-digit PIN code.'
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus(null)
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const payload = {
      label: form.label.trim() || 'Home',
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      country: form.country.trim() || 'India',
      is_default: Boolean(form.is_default)
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateAddress(editingId, user.id, payload)
        setStatus({ type: 'success', text: 'Address updated successfully.' })
      } else {
        await createAddress(user.id, payload)
        setStatus({ type: 'success', text: 'Address added successfully.' })
      }
      resetForm()
      await loadAddresses()
    } catch (err) {
      setError(err.message || 'Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return
    setStatus(null)
    setError(null)
    try {
      await deleteAddress(id, user.id)
      setStatus({ type: 'success', text: 'Address deleted.' })
      await loadAddresses()
    } catch (err) {
      setError(err.message || 'Failed to delete address')
    }
  }

  const handleSetDefault = async (id) => {
    setStatus(null)
    setError(null)
    try {
      await setDefaultAddress(id, user.id)
      setStatus({ type: 'success', text: 'Default address updated.' })
      await loadAddresses()
    } catch (err) {
      setError(err.message || 'Failed to set default address')
    }
  }

  if (authLoading) {
    return <div className="account-subpage"><div className="container"><p>Loading...</p></div></div>
  }

  if (!user) {
    return (
      <div className="account-subpage">
        <div className="container">
          <Link to="/account" className="account-subpage__back">← Back to Account</Link>
          <div className="account-subpage__card">
            <p className="eyebrow">SOLEHUB ACCOUNT</p>
            <h1>Addresses</h1>
            <p className="text-gray">Please sign in to manage your saved addresses.</p>
            <Link to="/login" className="btn btn--primary btn--large">Login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-subpage">
      <div className="container">
        <Link to="/account" className="account-subpage__back">← Back to Account</Link>
        <div className="account-subpage__card">
          <div className="addresses-header">
            <div>
              <p className="eyebrow">SOLEHUB ACCOUNT</p>
              <h1>Addresses</h1>
              <p className="text-gray">Manage the delivery addresses for your SoleHub orders.</p>
            </div>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}
          {status && <div className={status.type === 'error' ? 'auth-error' : 'account-success'} role="status">{status.text}</div>}

          {showForm && (
            <form onSubmit={submit} className="auth-form address-form">
              <div className="address-form__head">
                <h2>{editingId ? 'Edit Address' : 'New Address'}</h2>
                <button type="button" className="address-form__close" onClick={resetForm} aria-label="Close form">
                  <X size={20} />
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="label" className="form-label">Label</label>
                  <input type="text" id="label" name="label" value={form.label} onChange={handleChange} className="form-input" placeholder="Home, Work..." />
                </div>
                <div className="form-group">
                  <label htmlFor="full_name" className="form-label">Full Name <span className="text-orange" aria-hidden="true">*</span></label>
                  <input type="text" id="full_name" name="full_name" value={form.full_name} onChange={handleChange} className="form-input" autoComplete="name" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address-phone" className="form-label">Mobile Number <span className="text-orange" aria-hidden="true">*</span></label>
                <div className="phone-input">
                  <span>+91</span>
                  <input id="address-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" placeholder="9876543210" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address_line1" className="form-label">Address Line 1 <span className="text-orange" aria-hidden="true">*</span></label>
                <input type="text" id="address_line1" name="address_line1" value={form.address_line1} onChange={handleChange} className="form-input" placeholder="House number, street" autoComplete="address-line1" required />
              </div>

              <div className="form-group">
                <label htmlFor="address_line2" className="form-label">Address Line 2 <span className="text-gray">(optional)</span></label>
                <input type="text" id="address_line2" name="address_line2" value={form.address_line2} onChange={handleChange} className="form-input" placeholder="Area, landmark" autoComplete="address-line2" />
              </div>


              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">City <span className="text-orange" aria-hidden="true">*</span></label>
                  <input type="text" id="city" name="city" value={form.city} onChange={handleChange} className="form-input" autoComplete="address-level2" required />
                </div>
                <div className="form-group">
                  <label htmlFor="state" className="form-label">State <span className="text-orange" aria-hidden="true">*</span></label>
                  <select id="state" name="state" value={form.state} onChange={handleChange} className="form-input" autoComplete="address-level1" required>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="postal_code" className="form-label">PIN Code <span className="text-orange" aria-hidden="true">*</span></label>
                  <input type="text" id="postal_code" name="postal_code" value={form.postal_code} onChange={handleChange} className="form-input" inputMode="numeric" placeholder="e.g. 110001" autoComplete="postal-code" required />
                </div>
                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country</label>
                  <input type="text" id="country" name="country" value={form.country} onChange={handleChange} className="form-input" autoComplete="country-name" />
                </div>
              </div>

              <label className="form-checkbox">
                <input type="checkbox" name="is_default" checked={form.is_default} onChange={(event) => setForm({ ...form, is_default: event.target.checked })} />
                <span>Set as default address</span>
              </label>

              <div className="address-form__actions">
                <button type="button" className="btn btn--ghost" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn--primary btn--large" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Address'}
                </button>
              </div>
            </form>
          )}


          {loading ? (
            <p className="text-gray">Loading addresses...</p>
          ) : addresses.length === 0 && !showForm ? (
            <div className="addresses-empty">
              <MapPin size={40} strokeWidth={1.5} />
              <h2>No addresses yet</h2>
              <p className="text-gray">Add a delivery address to speed up checkout.</p>
              <button type="button" className="btn btn--primary" onClick={startAdd}>
                <Plus size={18} /> Add Your First Address
              </button>
            </div>
          ) : (
            <div className="addresses-management">
              {!showForm && (
                <div className="addresses-management__header">
                  <div>
                    <p className="eyebrow">SAVED ADDRESSES</p>
                    <h2>Manage Addresses</h2>
                    <p className="text-gray">Edit your saved address or add another delivery address.</p>
                  </div>
                </div>
              )}
              <div className="address-list">
                {addresses.map(address => (
                  <article key={address.id} className={`address-card ${address.is_default ? 'address-card--default' : ''}`}>
                    <div className="address-card__top">
                      <span className="address-card__label">
                        <MapPin size={16} strokeWidth={1.8} /> {address.label || 'Address'}
                      </span>
                      {address.is_default && <span className="address-card__badge"><Star size={14} /> Default</span>}
                    </div>
                    <p className="address-card__name">{address.full_name}</p>
                    <p className="address-card__lines">
                      {address.address_line1}
                      {address.address_line2 ? `, ${address.address_line2}` : ''}<br />
                      {address.city}, {address.state} - {address.postal_code}<br />
                      {address.country}
                    </p>
                    {address.phone && <p className="address-card__phone">+91 {address.phone.replace('+91', '')}</p>}
                    <div className="address-card__actions">
                      {!address.is_default && (
                        <button type="button" className="address-action" onClick={() => handleSetDefault(address.id)}>
                          <Star size={16} /> Set Default
                        </button>
                      )}
                      <button type="button" className="address-action" onClick={() => startEdit(address)}>
                        <Pencil size={16} /> Edit
                      </button>
                      <button type="button" className="address-action address-action--danger" onClick={() => handleDelete(address.id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                      <button type="button" className="address-action address-action--add" onClick={startAdd}>
                        <Plus size={16} /> Add Another Address
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Addresses

