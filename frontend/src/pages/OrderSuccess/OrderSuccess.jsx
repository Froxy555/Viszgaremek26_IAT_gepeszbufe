import React, { useContext, useEffect, useState } from 'react';
import './OrderSuccess.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';

// Sikeres rendelés visszajelző oldal komponens
const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { url, token, currency } = useContext(StoreContext);

  // Állapotok a rendelés adatainak, a betöltésnek és a hibáknak
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Átvételi kód beállítása (ha érkezik a navigációs állapottal)
  const initialCode = location.state?.randomCode || '';
  const [randomCode, setRandomCode] = useState(initialCode);

  // Rendelés adatainak lekérése a szerverről
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${url}/api/order/${orderId}`, {
          headers: { token },
        });
        if (response.data.success) {
          setOrder(response.data.data);
          setRandomCode(response.data.data.randomCode || initialCode);
        } else {
          setError(response.data.message || 'Nem található a rendelés.');
        }
      } catch (err) {
        setError('Nem sikerült betölteni a rendelést.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token, url, navigate, initialCode]);

  // Betöltési fázis megjelenítése
  if (loading) {
    return (
      <div className="order-success-page">
        <div className="spinner" />
      </div>
    );
  }

  // Hibaüzenet megjelenítése, ha nem sikerült a betöltés
  if (error || !order) {
    return (
      <div className="order-success-page">
        <div className="order-success-card">
          <p>{error || 'Nem található a rendelés.'}</p>
          <button type="button" onClick={() => navigate('/myorders')}>Vissza a rendeléseimhez</button>
        </div>
      </div>
    );
  }

  const totalAmount = order.amount ?? 0;

  return (
    <div className="order-success-page section animate-fade-up">
      <div className="order-success-card">
        {/* Siker ikon */}
        <div className="order-success-icon-wrapper">
          <div className="order-success-icon" />
        </div>
        <h2>Sikeres megrendelés!</h2>
        <p className="order-success-subtitle">Köszönjük a rendelésed, hamarosan megkezdjük a feldolgozást.</p>

        {/* Átvételi kód megjelenítése */}
        {randomCode && (
          <div className="order-success-code">
            <p>Átvételi kódod:</p>
            <span>{randomCode}</span>
          </div>
        )}

        {/* Rendelés alapvető adatai */}
        <div className="order-success-details">
          <div className="order-success-row">
            <span>Rendelés azonosító</span>
            <span>{order._id}</span>
          </div>
          <div className="order-success-row">
            <span>Dátum</span>
            <span>{order.formattedDate}</span>
          </div>
          <div className="order-success-row total">
            <span>Összesen</span>
            <span>{totalAmount}{currency}</span>
          </div>
        </div>

        {/* Rendelt tételek listája */}
        <div className="order-success-items">
          <h3>Rendelés részletei</h3>
          <ul>
            {order.items.map((item) => (
              <li key={item._id || item.name}>
                <span className="item-name">{item.name}</span>
                <span className="item-qty">x {item.quantity}</span>
                <span className="item-price">{item.price * item.quantity}{currency}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigációs gombok */}
        <div className="order-success-actions">
          <button type="button" className="primary" onClick={() => navigate('/myorders')}>
            Rendeléseim megtekintése
          </button>
          <button type="button" onClick={() => navigate('/')}>
            Vissza a főoldalra
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
