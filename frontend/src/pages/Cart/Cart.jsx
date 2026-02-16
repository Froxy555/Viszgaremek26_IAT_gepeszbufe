import React, { useContext, useEffect, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';

// Kosár oldal komponens
const Cart = () => {

  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, currency, setSpecialRequest } = useContext(StoreContext);
  const navigate = useNavigate();
  const [specialRequestText, setSpecialRequestText] = useState('');

  // Speciális kérés betöltése localStorage-ból, ha létezik
  useEffect(() => {
    window.scrollTo(0, 0);

    // Kérés betöltése
    const savedRequest = localStorage.getItem("specialRequest");
    if (savedRequest) {
      setSpecialRequestText(savedRequest);
      setSpecialRequest(savedRequest);
    }
  }, [setSpecialRequest]);

  // Speciális kérés input mező változásának kezelése
  const handleSpecialRequestChange = (e) => {
    const value = e.target.value;
    setSpecialRequestText(value);
    setSpecialRequest(value);
    localStorage.setItem("specialRequest", value);
  };

  // Kosárban lévő elemek szűrése
  const itemsInCart = food_list.filter((item) => cartItems[item._id] > 0);
  // Végösszeg számolása
  const totalAmount = getTotalCartAmount() === 0 ? 0 : getTotalCartAmount();

  return (
    <div className='cart section animate-fade-up'>
      <h2>Kosár</h2>
      <div className="cart-layout">
        <div className="cart-left">
          {itemsInCart.length === 0 ? (
            <div className="cart-empty">
              <p>A kosarad jelenleg üres.</p>
              <button onClick={() => navigate('/?section=menu')}>Vissza a menühöz</button>
            </div>
          ) : (
            itemsInCart.map((item) => (
              <div className="cart-item-card" key={item._id}>
                <div className="cart-item-main">
                  <img src={url + "/images/" + item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-unit-price">{item.price}{currency} / db</p>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-item-qty">{cartItems[item._id]}</div>
                  <p className="cart-item-total">{item.price * cartItems[item._id]}{currency}</p>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Eltávolítás
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-right">
          <div className="cart-summary-card">
            <h3>Összegzés</h3>
            <div className="cart-summary-row">
              <span>Végösszeg</span>
              <span>{totalAmount}{currency}</span>
            </div>
            <button
              type="button"
              disabled={totalAmount === 0}
              onClick={() => navigate('/order')}
            >
              Vásárlás
            </button>
          </div>

          <div className="cart-note-card">
            <h4>Megjegyzés a rendeléshez</h4>
            <input
              type="text"
              placeholder='nem kérek hagymát'
              value={specialRequestText}
              onChange={handleSpecialRequestChange}
            />
            {specialRequestText && (
              <p className="cart-note-saved">Kérés elmentve!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart