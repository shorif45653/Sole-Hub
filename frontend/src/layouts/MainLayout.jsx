import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileBottomNav from '../components/MobileBottomNav'

const MainLayout = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className={`main-layout ${isLoginPage ? 'main-layout--auth' : ''}`}>
      <Navbar />
      <main className="main-layout__content">
        <Outlet />
      </main>
      {!isLoginPage && <Footer />}
      {!isLoginPage && <MobileBottomNav />}
    </div>
  )
}

export default MainLayout