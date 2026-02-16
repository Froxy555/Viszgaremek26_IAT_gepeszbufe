import React, { useState } from 'react'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import Settings from './pages/Settings/Settings'
import OrderSuccess from './pages/OrderSuccess/OrderSuccess'
import CartSidebar from './components/CartSidebar/CartSidebar'
import MobileCartButton from './components/MobileCartButton/MobileCartButton'

// Fő alkalmazás komponens
const App = () => {

  // Bejelentkező felugró ablak megjelenítésének állapota
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  // Footer elrejtése bizonyos oldalakon a tisztább megjelenés érdekében
  const hideFooter =
    location.pathname === '/cart' ||
    location.pathname === '/myorders' ||
    location.pathname === '/order' ||
    location.pathname.startsWith('/order-success');

  return (
    <>
      <ToastContainer />
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        {!(location.pathname === '/cart' || location.pathname === '/order' || location.pathname.startsWith('/order-success')) && <CartSidebar />}
        <MobileCartButton />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/order-success/:orderId' element={<OrderSuccess />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/verify' element={<Verify />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
    </>
  )
}

export default App
