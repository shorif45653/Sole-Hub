import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import AccountPlaceholder from './pages/AccountPlaceholder'
import Profile from './pages/Profile'
import Addresses from './pages/Addresses'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders'
import OrderDetails from './pages/OrderDetails'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminProductForm from './pages/admin/ProductForm'
import AdminOrders from './pages/admin/Orders'
import AdminUsers from './pages/admin/Users'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="account" element={<Account />} />
            <Route path="account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="account/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
            <Route path="account/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="privacy" element={<AccountPlaceholder />} />
            <Route path="refund-policy" element={<AccountPlaceholder />} />
            <Route path="track-order" element={<ProtectedRoute><AccountPlaceholder /></ProtectedRoute>} />
            <Route path="refund-exchange" element={<AccountPlaceholder />} />
          </Route>
          
          {/* Protected routes */}
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          
          {/* Admin routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
            <Route path="products/add" element={<ProtectedRoute requireAdmin><AdminProductForm /></ProtectedRoute>} />
            <Route path="products/edit/:id" element={<ProtectedRoute requireAdmin><AdminProductForm /></ProtectedRoute>} />
            <Route path="orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
            <Route path="orders/:id" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App