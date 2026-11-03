import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import MobileBottomNav from '../components/MobileBottomNav'

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-layout__content">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}

export default MainLayout