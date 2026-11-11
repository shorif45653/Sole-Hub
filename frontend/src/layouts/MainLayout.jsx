import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileBottomNav from '../components/MobileBottomNav'
import BackButton from '../components/BackButton'

const MainLayout = () => {
  const location = useLocation()
  const isAuthSection = location.pathname === '/login'
    || location.pathname === '/account'
    || location.pathname.startsWith('/account/')

  return (
    <div className={`main-layout ${isAuthSection ? 'main-layout--auth' : ''}`}>
      <Navbar />
      <main className="main-layout__content">
        {location.pathname !== '/' && <BackButton className="back-button--main" />}
        <Outlet />
      </main>
      {!isAuthSection && <Footer />}
      {!isAuthSection && <MobileBottomNav />}
    </div>
  )
}

export default MainLayout