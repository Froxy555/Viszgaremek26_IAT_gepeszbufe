import React, { useState, useEffect, useContext } from 'react'
import Home from './pages/Home/Home'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Cart from './pages/Cart/Cart'
import LoginPopup from './components/LoginPopup/LoginPopup'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify/Verify'
import Settings from './pages/Settings/Settings'
import OrderSuccess from './pages/OrderSuccess/OrderSuccess'
import CartSidebar from './components/CartSidebar/CartSidebar'
import MobileCartButton from './components/MobileCartButton/MobileCartButton'
import Chatbot from './components/Chatbot/Chatbot'
import { StoreContext } from './Context/StoreContext'
import { io } from 'socket.io-client'

// Fő alkalmazás komponens
const App = () => {

  // Bejelentkező felugró ablak megjelenítésének állapota
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const { userData, url } = useContext(StoreContext);

  // WebSocket valós idejű rendeléskövetés
  useEffect(() => {
    if (!url) return;
    const socket = io(url);

    socket.on('statusUpdated', (updatedOrder) => {
      let isMyOrder = false;

      // 1. Megnézzük be van-e lépve a Userünk és övé-e
      if (userData?._id && updatedOrder.userId === userData._id) {
        isMyOrder = true;
      }

      // 2. Vendég rendelések ellenőrzése a böngésző memóriájából
      const guestOrdersRow = localStorage.getItem('guestOrders');
      if (guestOrdersRow) {
        try {
          const guestList = JSON.parse(guestOrdersRow);
          if (guestList.includes(updatedOrder._id)) {
            isMyOrder = true;
          }
        } catch (e) { console.error(e) }
      }

      // Ha hozzám tartozik, megjelenítjük az értesítést
      if (isMyOrder) {
        if (updatedOrder.status === 'Elkészült') {
          toast.success(`🎉 Elkészült a rendelésed! Kód: ${updatedOrder.randomCode} Gyere érte!`, {
            autoClose: false, // Ne záródjon be magától
            theme: "colored"
          });
        } else if (updatedOrder.status === 'Átvéve') {
          toast.info(`🍔 Rendelés átadva. Jó étvágyat!`, { autoClose: 3000 });
        } else {
          toast.info(`⏱️ Rendelésed (${updatedOrder.randomCode}) állapota: ${updatedOrder.status}`, { autoClose: 5000 });
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userData, url]);

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
        {!showLogin && !(location.pathname === '/cart' || location.pathname === '/order' || location.pathname.startsWith('/order-success')) && <CartSidebar />}
        {!showLogin && <MobileCartButton />}
        {!showLogin && location.pathname === '/' && <Chatbot />}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/order-success/:orderId' element={<OrderSuccess />} />
          <Route path='/myorders' element={<MyOrders />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/verify' element={<Verify />} />
        </Routes>
        {!hideFooter && <Footer />}
      </div>
    </>
  )
}

export default App
