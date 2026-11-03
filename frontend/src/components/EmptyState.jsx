import { Link } from 'react-router-dom'
import { ShoppingBag, Search, Package, User, Heart } from 'lucide-react'

const EmptyState = ({ 
  type = 'default',
  title,
  description,
  actionLabel,
  actionPath,
  icon: CustomIcon
}) => {
  const configs = {
    cart: {
      icon: ShoppingBag,
      defaultTitle: 'Your Cart is Empty',
      defaultDescription: 'Looks like you haven\'t added any shoes yet. Time to find your perfect pair!',
      defaultActionLabel: 'Start Shopping',
      defaultActionPath: '/shop'
    },
    orders: {
      icon: Package,
      defaultTitle: 'No Orders Yet',
      defaultDescription: 'You haven\'t placed any orders. When you do, they\'ll appear here.',
      defaultActionLabel: 'Browse Collection',
      defaultActionPath: '/shop'
    },
    wishlist: {
      icon: Heart,
      defaultTitle: 'Your Wishlist is Empty',
      defaultDescription: 'Save your favorite styles for later by clicking the heart icon on any product.',
      defaultActionLabel: 'Explore Products',
      defaultActionPath: '/shop'
    },
    search: {
      icon: Search,
      defaultTitle: 'No Results Found',
      defaultDescription: 'We couldn\'t find any products matching your search. Try adjusting your filters or search terms.',
      defaultActionLabel: 'Clear Filters',
      defaultActionPath: '/shop'
    },
    products: {
      icon: Package,
      defaultTitle: 'No Products Available',
      defaultDescription: 'There are no products in this category at the moment. Check back soon!',
      defaultActionLabel: 'View All Products',
      defaultActionPath: '/shop'
    },
    account: {
      icon: User,
      defaultTitle: 'Welcome to Your Account',
      defaultDescription: 'Sign in to track orders, manage your profile, and save your favorites.',
      defaultActionLabel: 'Sign In',
      defaultActionPath: '/login'
    },
    default: {
      icon: Package,
      defaultTitle: 'Nothing Here',
      defaultDescription: 'We couldn\'t find what you\'re looking for.',
      defaultActionLabel: 'Go Home',
      defaultActionPath: '/'
    }
  }

  const config = configs[type] || configs.default
  const Icon = CustomIcon || config.icon

  return (
    <div className="empty-state" role="status">
      <div className="empty-state__icon-wrapper">
        <Icon className="empty-state__icon" size={64} aria-hidden="true" />
      </div>
      <h2 className="empty-state__title">
        {title || config.defaultTitle}
      </h2>
      <p className="empty-state__text">
        {description || config.defaultDescription}
      </p>
      {actionLabel || config.defaultActionLabel ? (
        <Link 
          to={actionPath || config.defaultActionPath} 
          className="btn btn--primary empty-state__action"
        >
          {actionLabel || config.defaultActionLabel}
        </Link>
      ) : null}
    </div>
  )
}

export default EmptyState