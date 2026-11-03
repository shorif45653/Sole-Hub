import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { generateTransactionRef, processDemoPayment } from '../services/orderService'
import { formatCurrency } from '../utils/formatCurrency'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const DemoPayment = () => {
  const { orderId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (id, name, brand, images)
          )
        `)
        .eq('id', orderId)
        .single()
      
      if (orderError) throw orderError
      
      if (orderData.user_id !== user.id) {
        setError('You do not have access to this order')
        setLoading(false)
        return
      }

      setOrder(orderData)

      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setPayment(paymentData)
    } catch (err) {
      console.error('Load order error:', err)
      setError(err.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const processPayment = async (simulateSuccess) => {
    setProcessing(true)
    setResult(null)
    setError(null)

    try {
      const transactionRef = generateTransactionRef()
      
      const data = await processDemoPayment({
        p_order_id: orderId,
        p_transaction_reference: transactionRef,
        p_payment_method: order.payment_method,
        p_amount: order.total_amount,
        p_simulate_success: simulateSuccess,
        p_is_demo: true
      })
      
      setResult(simulateSuccess ? 'success' : 'failed')
      setPayment(data)
      
      if (simulateSuccess) {
        setTimeout(() => {
          navigate(`/orders/${orderId}`)
        }, 2000)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <LoadingSpinner size="lg" text="Loading order..." />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="payment-page">
        <div className="container">
          <EmptyState type="default" title="Payment Error" description={error || 'Unable to load order details.'} actionLabel="Back to Orders" actionPath="/my-orders" />
        </div>
      </div>
    )
  }

  const alreadyPaid = payment?.status === 'SUCCESS' || order.payment_status === 'SUCCESS'

  return (
    <div className="payment-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/my-orders">My Orders</Link>
          <span>/</span>
          <span>Payment</span>
        </nav>

        <div className="payment__warning">
          <strong>DEMO PAYMENT — NO REAL MONEY WILL BE CHARGED.</strong>
          <p>This is a simulated payment system for internship demonstration purposes only.</p>
        </div>

        <div className="payment-layout">
          <div className="payment-order-summary">
            <h2>Order #{order.id.slice(0, 8).toUpperCase()}</h2>
            <div className="payment-order-items">
              {order.order_items.map(item => (
                <div key={item.id} className="payment-order-item">
                  <span>{item.product_name} × {item.quantity}</span>
                  <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="payment-order-total">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="payment-method-badge">
              Payment Method: {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
            </div>
          </div>

          <div className="payment-actions">
            {alreadyPaid ? (
              <div className="payment-completed">
                <div className="payment-completed__icon" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3>Payment Successful!</h3>
                <p>Your order has been confirmed. Thank you for shopping with SoleHub.</p>
                <Link to={`/orders/${orderId}`} className="btn btn--primary">View Order Details</Link>
              </div>
            ) : result === 'success' ? (
              <div className="payment-completed">
                <div className="payment-completed__icon" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3>Payment Successful!</h3>
                <p>Your order has been confirmed. Thank you for shopping with SoleHub.</p>
                <Link to={`/orders/${orderId}`} className="btn btn--primary">View Order Details</Link>
              </div>
            ) : result === 'failed' ? (
              <div className="payment-failed">
                <div className="payment-failed__icon" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                </div>
                <h3>Payment Failed</h3>
                <p>The demo payment simulation failed. You can try again.</p>
                <div className="payment-retry">
                  <button onClick={() => processPayment(true)} className="btn btn--primary" disabled={processing}>
                    {processing ? 'Processing...' : 'Retry Payment'}
                  </button>
                  <button onClick={() => processPayment(false)} className="btn btn--outline" disabled={processing}>
                    Simulate Failure
                  </button>
                </div>
                <Link to="/my-orders" className="btn btn--ghost mt-sm">Back to Orders</Link>
              </div>
            ) : (
              <div className="payment-form">
                <h3>Complete Your Payment</h3>
                <p>Order Amount: <strong>{formatCurrency(order.total_amount)}</strong></p>
                <p>Payment Method: {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}</p>
                
                <div className="payment-options">
                  <button onClick={() => processPayment(true)} className="btn btn--primary btn--large payment-btn" disabled={processing}>
                    {processing ? 'Processing...' : 'Confirm Demo Payment'}
                  </button>
                  <button onClick={() => processPayment(false)} className="btn btn--outline payment-btn" disabled={processing}>
                    Simulate Failure
                  </button>
                </div>
                
                <div className="payment-note">
                  <small>
                    This is a simulated payment. No real money will be charged.
                    Transaction reference will be generated for demonstration purposes.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoPayment