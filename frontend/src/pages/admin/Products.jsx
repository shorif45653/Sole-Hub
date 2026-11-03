import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import { getAllProductsAdmin, toggleProductStatus, deleteProduct as deleteProductAdmin } from '../../services/adminService'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Search, Plus, MoreVertical } from 'lucide-react'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data } = await getAllProductsAdmin()
      setProducts(data || [])
    } catch (err) {
      console.error('Products load error:', err)
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleStatus = async (id, currentStatus) => {
    setError(null)
    setMessage(null)
    try {
      await toggleProductStatus(id, !currentStatus)
      await loadProducts()
      setMessage(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully.`)
    } catch (err) {
      setError(err.message || 'Failed to update product status')
    }
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    setError(null)
    setMessage(null)
    try {
      const result = await deleteProductAdmin(id)
      await loadProducts()
      setMessage(result.deactivated
        ? 'This product is part of order history, so it was safely deactivated instead of deleted.'
        : 'Product deleted successfully.')
    } catch (err) {
      setError(err.message || 'Failed to delete product')
    }
  }

  const handleMenuClick = (id, e) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === id ? null : id)
  }

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (loading) {
    return (
      <div className="admin-products-page">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-products-page">
        <EmptyState type="default" title="Unable to Load Products" description={error} actionLabel="Try Again" actionPath="/" />
      </div>
    )
  }

  return (
    <div className="admin-products-page">
      <div className="admin-products-header">
        <div className="admin-products-header__main">
          <h1 className="admin-products-header__title">Products</h1>
          <span className="admin-products-header__count">{products.length} items</span>
        </div>
        <div className="admin-products-header__actions">
          <div className="admin-search">
            <Search size={18} className="admin-search__icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="admin-search__input"
              aria-label="Search products"
            />
          </div>
          <Link to="/admin/products/add" className="btn btn--primary btn--compact">
            <Plus size={16} aria-hidden="true" /> Add Product
          </Link>
        </div>
      </div>

      {message && <div className="admin-alert admin-alert--success" role="status">{message}</div>}
      {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}

      {filteredProducts.length === 0 ? (
        <EmptyState type="products" title="No Products" description={searchTerm ? 'No products match your search.' : 'No products found. Add your first product to get started.'} actionLabel="Add Product" actionPath="/admin/products/add" />
      ) : (
        <div className="admin-products-table-wrapper">
          <table className="admin-table" role="table" aria-label="Product management">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Brand</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="admin-table__cell--product">
                    <img
                      src={product.images?.[0] || '/shoe-fallback.svg'}
                      alt=""
                      className="admin-table__thumb"
                      onError={e => { e.currentTarget.src = '/shoe-fallback.svg' }}
                    />
                    <div className="admin-table__product-info">
                      <span className="admin-table__product-name">{product.name}</span>
                    </div>
                  </td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td className="admin-table__price">
                    {formatCurrency(product.price)}
                    {product.discount_price && (
                      <span className="admin-table__sale-price">{formatCurrency(product.discount_price)}</span>
                    )}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <span className={`status-badge ${product.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <div className="admin-dropdown" onClick={e => handleMenuClick(product.id, e)}>
                        <button
                          type="button"
                          className="admin-dropdown__trigger"
                          aria-label="More actions"
                          aria-expanded={activeMenuId === product.id}
                        >
                          <MoreVertical size={18} aria-hidden="true" />
                        </button>
                        {activeMenuId === product.id && (
                          <div className="admin-dropdown__menu" role="menu">
                            <Link to={`/admin/products/edit/${product.id}`} className="admin-dropdown__item" role="menuitem" onClick={() => setActiveMenuId(null)}>
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="admin-dropdown__item"
                              role="menuitem"
                              onClick={() => { toggleStatus(product.id, product.is_active); setActiveMenuId(null); }}
                            >
                              {product.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              className="admin-dropdown__item admin-dropdown__item--danger"
                              role="menuitem"
                              onClick={() => { deleteProduct(product.id); setActiveMenuId(null); }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
