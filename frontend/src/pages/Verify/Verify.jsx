import axios from 'axios';
import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext';
import './Verify.css'

// Stripe fizetés ellenőrzése oldal komponens
const Verify = () => {
  const { url } = useContext(StoreContext)
  const [searchParams, setSearchParams] = useSearchParams();

  // URL paraméterek kinyerése (success: sikeresség, orderId: rendelés azonosító)
  const success = searchParams.get("success")
  const orderId = searchParams.get("orderId")

  const navigate = useNavigate();

  // Fizetés állapotának ellenőrzése a szerveren
  const verifyPayment = async () => {
    const response = await axios.post(url + "/api/order/verify", { success, orderId });
    if (response.data.success) {
      // Sikeres fizetés esetén átirányítás a siker oldalra az átvételi kóddal
      navigate(`/order-success/${orderId}`, {
        state: { randomCode: response.data.randomCode }
      });
    }
    else {
      // Hiba vagy megszakított fizetés esetén visszaküldés a főoldalra
      navigate("/")
    }
  }

  // Ellenőrzés futtatása a komponens betöltésekor
  useEffect(() => {
    verifyPayment();
  }, [])

  return (
    <div className='verify'>
      <div className="spinner"></div>
    </div>
  )
}

export default Verify
