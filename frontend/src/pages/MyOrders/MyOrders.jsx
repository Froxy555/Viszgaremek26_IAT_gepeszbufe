import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';

// Rendeléseim oldal komponens
const MyOrders = () => {

  const [data, setData] = useState([]);
  const { url, token, currency } = useContext(StoreContext);
  const navigate = useNavigate();

  // Állapotok a lemondás módalhoz
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelingOrder, setCancelingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // Rendelések lekérése
  const fetchOrders = async () => {
    if (token) {
      // Bejelentkezett felhasználó rendelései
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
      setData(response.data.data)
    } else {
      // Vendég mód: rendelések betöltése localStorage-ból
      const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
      if (guestOrders.length > 0) {
        // Rendelések lekérése egyenként
        const loadedOrders = [];
        for (const orderId of guestOrders) {
          try {
            const response = await axios.get(`${url}/api/order/${orderId}`);
            if (response.data.success) {
              loadedOrders.push(response.data.data);
            }
          } catch (err) {
            console.error("Error fetching guest order:", err);
          }
        }
        // Rendezés dátum szerint csökkenő sorrendbe
        loadedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(loadedOrders);
      }
    }
  }

  // Adatok betöltése token változáskor vagy komponens betöltésekor
  useEffect(() => {
    fetchOrders();
  }, [token])

  // Lemondás panel megjelenítése
  const openCancelModal = (order) => {
    setCancelingOrder(order);
    setCancelReason("");
    setShowCancelModal(true);
  }

  const closeCancelModal = () => {
    setCancelingOrder(null);
    setCancelReason("");
    setShowCancelModal(false);
  }

  // Tényleges lemondás API hívás
  const handleCancelSubmit = async () => {
    if (!cancelingOrder) return;

    const isReasonRequired = cancelingOrder.status === "Készítés alatt" || cancelingOrder.status === "Elkészült";
    if (isReasonRequired && (!cancelReason || cancelReason.trim() === "")) {
      toast.error("Ebben a fázisban kötelező megindokolni a lemondást!");
      return;
    }

    try {
      const response = await axios.post(`${url}/api/order/delete`, {
        orderId: cancelingOrder._id,
        reason: cancelReason
      }, { headers: { token } });

      if (response.data.success) {
        toast.success("Rendelés lemondva.");
        closeCancelModal();
        fetchOrders(); // Újratöltjük a listát a friss ststuszokkal
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Hiba történt a lemondás során.");
    }
  }

  return (
    <div className='my-orders section animate-fade-up'>
      <h2>Rendeléseim</h2>
      <div className="my-orders-container">
        {data.length === 0 ? (
          <div className="my-orders-empty">
            <p>Még nincs rendelésed.</p>
            <button type="button" onClick={fetchOrders}>Frissítés</button>
          </div>
        ) : (
          data.map((order, index) => {
            const itemSummary = order.items.map((item, idx) => {
              const baseText = `${item.name} x ${item.quantity}`;
              return idx === order.items.length - 1 ? baseText : baseText + ', ';
            });

            const statusLabel = order.status;

            const previewItems = order.items.slice(0, 3);

            return (
              <div key={index} className='my-orders-card'>
                <div className="my-orders-main">
                  <div className="my-orders-thumb-stack">
                    {previewItems.map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image ? `${url}/images/${item.image}` : assets.parcel_icon}
                        alt={item.name}
                      />
                    ))}
                  </div>
                  <div className="my-orders-info">
                    <p className="my-orders-title">{itemSummary}</p>
                    {order.items.some(item => item.exclusions && item.exclusions.length > 0) && (
                      <p className="my-orders-exclusions" style={{ color: '#ff4c24', fontSize: '12px', fontWeight: '500', margin: '4px 0 0 0' }}>
                        Nincs benne: {Array.from(new Set(order.items.flatMap(item => item.exclusions || []))).join(', ')}
                      </p>
                    )}
                    {order.items.some(item => item.additions && item.additions.length > 0) && (
                      <p className="my-orders-additions" style={{ color: '#16a34a', fontSize: '12px', fontWeight: '500', margin: '4px 0 0 0' }}>
                        Kér rá: {Array.from(new Set(order.items.flatMap(item => item.additions || []))).join(', ')}
                      </p>
                    )}
                    <p className="my-orders-meta">Elemek: {order.items.length} • Kód: <strong>{order.randomCode}</strong></p>
                  </div>
                </div>

                <div className="my-orders-side">
                  <p className="my-orders-amount">{order.amount}{currency}</p>
                  <span className={`my-orders-status my-orders-status-${order.status?.toLowerCase().replace(/\s+/g, '-') || 'default'}`}>
                    <span className="dot" />{statusLabel}
                  </span>
                  <div className="my-orders-actions">
                    <button
                      type="button"
                      className="my-orders-details-btn"
                      onClick={() => navigate(`/order-success/${order._id}`, { state: { randomCode: order.randomCode } })}
                    >
                      Rendelés részletei
                    </button>
                    <button type="button" onClick={fetchOrders}>Állapot frissítése</button>
                    {(!["Átvéve", "Törölve", "Vásárló által lemondva"].includes(order.status)) && (
                      <button
                        type="button"
                        className="my-orders-cancel-btn"
                        onClick={() => openCancelModal(order)}
                      >
                        Lemondás
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showCancelModal && cancelingOrder && createPortal(
        <div className="cancel-modal-overlay">
          <div className="cancel-modal">
            <h3>Rendelés lemondása</h3>
            <p className="cancel-modal-desc">
              Biztosan le szeretnéd mondani a rendelésedet?
              {(cancelingOrder.status === "Készítés alatt" || cancelingOrder.status === "Elkészült")
                ? " Mivel már készítjük/elkészítettük, kérünk, KÖTELEZŐEN röviden indokold meg a lemondást:"
                : " Kérünk, röviden indokold meg (nem kötelező):"}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Pl.: Közbejött egy felmérő..."
              rows={3}
            />
            <div className="cancel-modal-actions">
              <button className="cancel-modal-btn cancel" onClick={handleCancelSubmit}>Igen, lemondom</button>
              <button className="cancel-modal-btn keep" onClick={closeCancelModal}>Mégsem</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default MyOrders
