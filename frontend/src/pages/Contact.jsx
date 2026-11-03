import { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSuccess(true)
    }, 1000)
  }

  return (
    <div className="contact-page">
      <div className="container">
        <section className="section">
          <h1>Contact Us</h1>
          <p>Have a question? We would love to hear from you.</p>
          
          {success ? (
            <div className="empty-state">
              <div className="empty-state__icon" style={{ color: '#22c55e' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="empty-state__title">Message Sent!</h2>
              <p className="empty-state__text">Thank you for contacting SoleHub. We will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} className="form-textarea" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn btn--primary btn--large" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

export default Contact