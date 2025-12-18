import React, { useEffect, useState } from 'react'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import TwoFactorSetup from './pages/TwoFactorSetup/TwoFactorSetup'
import TrackOrder from './pages/TrackOrder/TrackOrder'
import DeliveryPartnerLogin from './pages/DeliveryPartnerLogin/DeliveryPartnerLogin'
import DeliveryDashboard from './pages/DeliveryDashboard/DeliveryDashboard'
import BackgroundAnimations from './components/BackgroundAnimations/BackgroundAnimations'

const App = () => {

  const [showLogin, setShowLogin] = useState(false);
  const [toastTheme, setToastTheme] = useState(() => (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'))

  useEffect(() => {
    const onThemeChange = (e) => {
      setToastTheme(e?.detail === 'dark' ? 'dark' : 'light')
    }
    window.addEventListener('themechange', onThemeChange)
    return () => window.removeEventListener('themechange', onThemeChange)
  }, [])

  return (
    <>
      <ToastContainer theme={toastTheme} />
      <BackgroundAnimations />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/track/:orderId' element={<TrackOrder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/settings/2fa' element={<TwoFactorSetup />} />
          <Route path='/delivery-login' element={<DeliveryPartnerLogin />} />
          <Route path='/delivery-dashboard' element={<DeliveryDashboard />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App
