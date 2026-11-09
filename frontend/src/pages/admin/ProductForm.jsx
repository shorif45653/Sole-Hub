import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createProductAdmin, getProductByIdAdmin, updateProductAdmin, uploadProductImage } from '../../services/adminService'
import { isNonNegativeInteger, isValidPrice } from '../../utils/validation'
import { ArrowLeft, Save, X } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'

const CATEGORIES = ['Lifestyle', 'Running', 'Formal', 'Basketball', 'Training']
const BRANDS = ['Nike', 'Adidas', 'ASICS', 'PUMA']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGES = 4
const initialProduct = { name: '', brand: '', category: 'Lifestyle', description: '', price: '', discount_price: '', images: [], sizes: '7, 8, 9, 10, 11', colors: 'White, Black', stock: '10', is_active: true }

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [product, setProduct] = useState(initialProduct)
  const [imageFiles, setImageFiles] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isDraggingImage, setIsDraggingImage] = useState(false)

  useEffect(() => {
    if (!id) return
    getProductByIdAdmin(id)
      .then(data => setProduct({
        ...data,
        images: data.images || [],
        sizes: (data.sizes || []).join(', '),
        colors: (data.colors || []).join(', '),
        price: String(data.price),
        discount_price: data.discount_price == null ? '' : String(data.discount_price),
        stock: String(data.stock)
      }))
      .catch(err => setError(err.message || 'Failed to load product'))
      .finally(() => setLoading(false))
  }, [id])

  const updateField = event => {
    const { name, value, type, checked } = event.target
    setProduct(current => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageFile = file => {
    setError(null)
    if (!file) return
    if (!IMAGE_TYPES.includes(file.type)) return setError('Use a JPG, PNG, or WebP image.')
    if (file.size > MAX_IMAGE_SIZE) return setError('Image must be 5 MB or smaller.')
    if (imageFiles.length >= MAX_IMAGES) return setError(`Maximum ${MAX_IMAGES} images allowed.`)
    setImageFiles(prev => [...prev, file])
  }

  const handleImageChange = event => {
    const files = Array.from(event.target.files || [])
    files.forEach(handleImageFile)
  }

  const handleImageDrop = event => {
    event.preventDefault()
    setIsDraggingImage(false)
    const files = Array.from(event.dataTransfer.files || [])
    files.forEach(handleImageFile)
  }

  const hasNewImages = imageFiles.length > 0

  const removeImage = index => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    const handlePaste = event => {
      const files = Array.from(event.clipboardData?.files || []).filter(file => IMAGE_TYPES.includes(file.type))
      files.forEach(handleImageFile)
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handleImageFile])

  const handleSubmit = async event => {
    event.preventDefault()
    setError(null)
    const name = product.name.trim()
    const brand = product.brand.trim()
    const description = product.description.trim()
    const price = Number(product.price)
    const discountPrice = product.discount_price === '' ? null : Number(product.discount_price)
    const stock = Number(product.stock)
    const sizes = product.sizes.split(',').map(value => Number(value.trim())).filter(Number.isInteger)
    const colors = product.colors.split(',').map(value => value.trim()).filter(Boolean)

    if (!name || !brand) return setError('Product name and brand are required.')
    if (!CATEGORIES.includes(product.category)) return setError('Choose a valid category.')
    if (!isValidPrice(price)) return setError('Enter a valid price between 0 and 999999.99.')
    if (discountPrice !== null && (!isValidPrice(discountPrice) || discountPrice >= price)) return setError('Discount price must be lower than the regular price.')
    if (!isNonNegativeInteger(stock)) return setError('Stock must be a non-negative whole number.')
    if (!sizes.length || sizes.some(size => size < 1)) return setError('Enter at least one valid size.')
    if (!colors.length) return setError('Enter at least one color.')

    setSaving(true)
    try {
      let images = product.images || []
      for (const file of imageFiles) {
        const uploaded = await uploadProductImage(file)
        images = [uploaded.url, ...images.filter(image => image !== uploaded.url)]
      }
      images = images.slice(0, MAX_IMAGES)
      const payload = {
        name,
        brand,
        category: product.category,
        description,
        price,
        discount_price: discountPrice,
        images,
        sizes,
        colors,
        stock,
        is_active: product.is_active === true
      }

      if (isEdit) {
        await updateProductAdmin(id, payload)
      } else {
        await createProductAdmin(payload)
      }
      navigate('/admin/products')
    } catch (err) {
      console.error('Product save error:', err)
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="product-form-page">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    )
  }

  return (
    <div className="product-form-page">
      <div className="product-form-header">
        <Link to="/admin/products" className="product-form-header__back" aria-label="Back to products">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div className="product-form-header__content">
          <h1 className="product-form-header__title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="product-form-header__subtitle">Manage your product catalog.</p>
        </div>
        <Link to="/admin/products" className="btn btn--ghost btn--compact" aria-label="Cancel">
          <X size={16} aria-hidden="true" /> Cancel
        </Link>
      </div>

      {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form" noValidate>
        <div className="product-form__grid">
          <div className="product-form__main">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Product Name <span className="required">*</span></label>
              <input id="name" name="name" value={product.name} onChange={updateField} className="form-input" required autoComplete="off" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand" className="form-label">Brand <span className="required">*</span></label>
                <select id="brand" name="brand" value={product.brand} onChange={updateField} className="form-select" required>
                  <option value="">Select Brand</option>
                  {BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="category" className="form-label">Category <span className="required">*</span></label>
                <select id="category" name="category" value={product.category} onChange={updateField} className="form-select" required>
                  {CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea id="description" name="description" value={product.description} onChange={updateField} className="form-textarea" rows="3" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price" className="form-label">Price <span className="required">*</span></label>
                <input type="number" id="price" name="price" value={product.price} onChange={updateField} className="form-input" step="0.01" min="0" required />
              </div>
              <div className="form-group">
                <label htmlFor="discount_price" className="form-label">Sale Price</label>
                <input type="number" id="discount_price" name="discount_price" value={product.discount_price} onChange={updateField} className="form-input" step="0.01" min="0" />
                <p className="form-hint">Optional. Must be lower than regular price.</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">Product Images</label>
              <div
                className={`form-image-upload ${isDraggingImage ? 'form-image-upload--dragging' : ''}`}
                onDragOver={event => { event.preventDefault(); setIsDraggingImage(true) }}
                onDragEnter={event => { event.preventDefault(); setIsDraggingImage(true) }}
                onDragLeave={event => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setIsDraggingImage(false)
                }}
                onDrop={handleImageDrop}
              >
                <input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} multiple className="form-input form-input--file" />
                <p className="form-image-upload__drop-hint">Drag and drop images here, choose files, or paste images from your clipboard (max 4).</p>
                <p className="form-hint">JPG, PNG, or WebP up to 5 MB each. Existing image URLs are preserved when editing.</p>
                {hasNewImages && (
                  <div className="form-image-upload__selected">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="form-image-upload__item">
                        <button type="button" onClick={() => removeImage(index)} className="form-image-upload__remove">×</button>
                        <span className="form-image-upload__name">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {product.images?.slice(0, MAX_IMAGES).map((img, index) => (
                  <img key={index} src={img} alt={`Current product image ${index + 1}`} className="admin-table__thumb form-image-upload__preview" onError={event => { event.currentTarget.src = '/shoe-fallback.svg' }} />
                ))}
                {hasNewImages && <p className="form-image-upload__count">{imageFiles.length} new image(s) ready to upload</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="sizes" className="form-label">Available Sizes <span className="required">*</span></label>
                <input id="sizes" name="sizes" value={product.sizes} onChange={updateField} className="form-input" required placeholder="e.g., 7, 8, 9, 10, 11" />
                <p className="form-hint">Comma-separated list of sizes.</p>
              </div>
              <div className="form-group">
                <label htmlFor="colors" className="form-label">Available Colors <span className="required">*</span></label>
                <input id="colors" name="colors" value={product.colors} onChange={updateField} className="form-input" required placeholder="e.g., White, Black, Red" />
                <p className="form-hint">Comma-separated list of colors.</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock" className="form-label">Stock Quantity <span className="required">*</span></label>
                <input type="number" id="stock" name="stock" value={product.stock} onChange={updateField} className="form-input" min="0" step="1" required />
              </div>
              <div className="form-group form-group--checkbox">
                <label className="form-label">&nbsp;</label>
                <label className="form-checkbox">
                  <input type="checkbox" name="is_active" checked={product.is_active === true} onChange={updateField} />
                  <span className="form-checkbox__label">Active product</span>
                </label>
              </div>
            </div>
          </div>

          <div className="product-form__actions">
            <button type="submit" className="btn btn--primary btn--large btn--full" disabled={saving}>
              {saving ? (
                <>
                  <span className="loading-spinner loading-spinner--sm" style={{width:16,height:16,marginRight:8}} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} aria-hidden="true" />
                  {isEdit ? 'Update Product' : 'Add Product'}
                </>)
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProductForm

