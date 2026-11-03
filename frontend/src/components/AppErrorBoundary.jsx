import { Component } from 'react'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('SoleHub render error:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: '3rem', background: '#F8F5EF', color: '#20201E', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 12px 32px rgba(32,32,30,.12)' }}>
            <p style={{ color: '#FF6238', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>SoleHub runtime error</p>
            <h1 style={{ margin: '1rem 0', fontSize: '2rem' }}>The page could not be rendered.</h1>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', background: '#f3f0ea', padding: '1rem', borderRadius: '8px' }}>{this.state.error.message}</pre>
            <button type="button" onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '.75rem 1rem', border: 0, borderRadius: '6px', background: '#FF6238', color: '#fff', cursor: 'pointer' }}>Reload page</button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary