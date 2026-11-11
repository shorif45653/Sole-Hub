import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminUsers = () => {
  const { user: currentUser } = useAuth()
  const currentUserId = currentUser?.id
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [filterRole])

  const loadUsers = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (filterRole !== 'all') {
        query = query.eq('role', filterRole)
      }

      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      setUsers(data || [])
    } catch (err) {
      console.error('Users load error:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (id, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (updateError) throw updateError
      loadUsers()
    } catch (err) {
      setError(err.message || 'Failed to update user role')
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <LoadingSpinner size="lg" text="Loading users..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="container">
          <EmptyState type="default" title="Unable to Load Users" description={error} actionLabel="Try Again" actionPath="/" />
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page-header">
          <h1>Customers</h1>
        </div>

        <div className="admin-filters">
          <label htmlFor="role-filter" className="form-label">Filter by Role</label>
          <select id="role-filter" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="form-select form-select--small">
            <option value="all">All Users</option>
            <option value="customer">Customers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        {error && <div className="auth-error" role="alert">{error}</div>}

        {users.length === 0 ? (
          <EmptyState type="default" title="No Users" description="No users found matching your criteria." actionLabel="View All" actionPath="/admin/users" />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table" role="table" aria-label="Customer management">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <span>{user.full_name || 'Unknown'}</span>
                    </td>
                    <td>
                      <span>{user.email || 'No email'}</span>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="form-select form-select--small"
                        disabled={user.id === currentUserId}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td>
                      <span>{new Date(user.created_at).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers