import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Rendelés leadása oldal komponens
const PlaceOrder = () => {
  // Fizetési mód állapota (alapértelmezett: utánvét/helyszíni)
  const [payment, setPayment] = useState("cod");
  const today = new Date().toISOString().split('T')[0];

  // Ügyfél adatok állapota
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: today,
    city: "",
    phone: ""
  });

  // Kontextusból származó globális adatok és függvények
  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems, currency, specialRequest, userData, itemModifications, setItemModifications, itemAdditions, setItemAdditions } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
  }, [specialRequest]);

  // Felhasználói adatok automatikus kitöltése, ha be van jelentkezve
  useEffect(() => {
    if (token && userData) {
      let firstName = "";
      let lastName = "";
      // Név szétszedése vezetéknévre és keresztnévre
      if (userData.name) {
        const nameParts = userData.name.split(' ');
        if (nameParts.length > 1) {
          lastName = nameParts[0]; // Magyar sorrend feltételezése (Vezetéknév Keresztnév)
          firstName = nameParts.slice(1).join(' ');
        } else {
          lastName = userData.name;
        }
      }

      // Adatok frissítése az állapotban
      setData(prev => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
      }));
    }
  }, [token, userData]);

  // Input mezők változásának kezelése
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  // Rendelés elküldése
  const placeOrder = async (e) => {
    e.preventDefault();

    // Speciális kérés lekérése kontextusból vagy localStorage-ból
    const noteToSend = specialRequest || localStorage.getItem("specialRequest") || "";

    // Rendelt tételek kigyűjtése
    let orderItems = food_list.filter(item => cartItems[item._id] > 0)
      .map(item => ({
        ...item,
        quantity: cartItems[item._id],
        exclusions: itemModifications[item._id] || [],
        additions: itemAdditions[item._id] || []
      }));

    // Validáció: szünet kiválasztása kötelező
    if (!data.city) {
      toast.error("Válaszd ki, hányadik szünetben veszed át.");
      return;
    }

    // Rendelési objektum összeállítása
    let orderData = {
      userId: token ? JSON.parse(localStorage.getItem('user'))?._id : `guest_${Date.now()}`,
      address: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        orderDate: data.street,
        breakTime: data.city,
        phone: data.phone
      },
      items: orderItems,
      amount: getTotalCartAmount(),
      note: noteToSend
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.token = token;
      }

      // API hívás fizetési módtól függően
      if (payment === "stripe") {
        let response = await axios.post(url + "/api/order/place", orderData, { headers });

        if (response.data.success) {
          localStorage.removeItem("specialRequest");
          setItemModifications({});
          setItemAdditions({});
          window.location.replace(response.data.session_url);
        } else {
          toast.error("Valami hiba történt");
        }
      } else {
        // Helyszíni fizetés (COD) hívása
        let response = await axios.post(url + "/api/order/placecod", orderData, { headers });

        if (response.data.success) {
          // Ha vendég ként rendelt, mentsük el az azonosítót helyileg
          if (!token) {
            const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
            guestOrders.push(response.data.orderId);
            localStorage.setItem('guestOrders', JSON.stringify(guestOrders));
          }

          localStorage.removeItem("specialRequest");
          setCartItems({});
          setItemModifications({});
          setItemAdditions({});
          // Átirányítás a siker oldalra
          navigate(`/order-success/${response.data.orderId}`, {
            state: { randomCode: response.data.randomCode }
          });
        } else {
          toast.error("Valami hiba történt");
        }
      }
    } catch (error) {
      console.error("Rendelés leadási hiba", error);
      toast.error("Valami hiba történt (Lehet, hogy be kell jelentkezned?)");
    }
  };

  // Ellenőrizzük, hogy van-e valami a kosárban, különben visszaküldi a kosár oldalra
  useEffect(() => {
    if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [getTotalCartAmount, navigate]);

  return (
    <form onSubmit={placeOrder} className='place-order section animate-fade-up'>
      {/* Bal oldali panel: Vásárlói adatok */}
      <div className="place-order-left">
        <p className='place-order-title'>Vásárlási információk</p>
        <div className="multi-field">
          <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='Vezetéknév' required />
          <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Keresztnév' required />
        </div>
        <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='Email cím' required />

        {/* Dátum kiválasztása */}
        <div className="place-order-field-group">
          <label>Megrendelési dátum</label>
          <input
            type="date"
            name='street'
            onChange={onChangeHandler}
            value={data.street}
            min={today}
            required
          />
        </div>

        {/* Szünet kiválasztása gombokkal (tabletta/pill stílus) */}
        <div className="place-order-field-group">
          <label>Hányadik szünetben</label>
          <div className="place-order-breaks">
            {["1", "2", "3", "4", "5", "6", "7"].map((value) => (
              <button
                key={value}
                type="button"
                className={`place-order-break-pill ${data.city === value ? 'active' : ''}`}
                onClick={() => setData(prev => ({ ...prev, city: value }))}
              >
                {value}. szünet
              </button>
            ))}
          </div>
        </div>
        <input type="text" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Telefonszám' required />

        {/* Megjegyzés (speciális kérés) megjelenítése, ha van */}
        {(specialRequest || localStorage.getItem("specialRequest")) && (
          <div className="place-order-note">
            <p className="place-order-note-label">Speciális kérés:</p>
            <p className="place-order-note-text">{specialRequest || localStorage.getItem("specialRequest")}</p>
          </div>
        )}
      </div>

      {/* Jobb oldali panel: Összegzés és Fizetés */}
      <div className="place-order-right">
        <div className="place-order-summary-card">
          <h2>Végösszeg</h2>
          <div className="place-order-summary-body">
            <div className="place-order-summary-row">
              <span>Összesen</span>
              <span className="place-order-summary-amount">{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount()}{currency}</span>
            </div>
          </div>
        </div>

        {/* Fizetési mód választó */}
        <div className="payment">
          <h2>Fizetési mód</h2>
          <div onClick={() => setPayment("cod")} className={`payment-option ${payment === 'cod' ? 'active' : ''}`}>
            <span className="payment-radio" />
            <div className="payment-content">
              <p className="payment-label">Helyben fizetés (KP/Bankkártya)</p>
              <p className="payment-desc">A büfében, átvételkor fizetsz készpénzzel vagy bankkártyával.</p>
            </div>
          </div>
          <div onClick={() => setPayment("stripe")} className={`payment-option ${payment === 'stripe' ? 'active' : ''}`}>
            <span className="payment-radio" />
            <div className="payment-content">
              <p className="payment-label">Online fizetés (Credit / Debit)</p>
              <p className="payment-desc">Biztonságos online fizetés bankkártyával.</p>
            </div>
          </div>
        </div>

        {/* Beküldés gomb */}
        <button className='place-order-submit' type='submit'>
          {payment === "cod" ? "Fizetés" : "Tovább a fizetéshez"}
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;