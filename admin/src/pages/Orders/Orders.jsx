import React, { useEffect, useState } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, url, currency } from '../../assets/assets';
import notificationSound from '../../assets/notification.mp3';
import { io } from 'socket.io-client';

const formatDate = (dateString) => {
  if (!dateString) return 'Dátum nem elérhető';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Dátum nem elérhető';
    }

    return new Intl.DateTimeFormat('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Dátum nem elérhető';
  }
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const previousOrdersLength = React.useRef(0);

  const playNotificationSound = () => {
    const audio = new Audio(notificationSound);
    audio.play().catch(error => console.log("Audio play failed:", error));
  }

  const fetchAllOrders = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        const newOrders = response.data.data;
        setOrders(newOrders);
        previousOrdersLength.current = newOrders.length;
      } else {
        if (!isAutoRefresh) toast.error("Hiba történt a rendelések betöltésekor");
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (!isAutoRefresh) toast.error("Hiba történt a rendelések betöltésekor");
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: event.target.value
      });

      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Státusz sikeresen frissítve");
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Hiba történt a státusz frissítésekor");
    }
  };

  useEffect(() => {
    fetchAllOrders();

    // WebSocket kapcsolat inicializálása valós idejű értesítésekhez
    const socket = io(url);

    // Új rendelés érkezett
    socket.on('newOrder', (order) => {
      playNotificationSound();
      toast.info("Új rendelés érkezett!");
      fetchAllOrders(true); // Csendes háttérfrissítés
    });

    // Ha valahol (pl. másik admin gépen) módosítják a státuszt, az is frissüljön
    socket.on('statusUpdated', (updatedOrder) => {
      fetchAllOrders(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className='order add'>
      <h3>Rendelések</h3>
      {loading ? (
        <div className="loading">Rendelések betöltése...</div>
      ) : (
        <div className="order-list">
          {orders.length === 0 ? (
            <div className="no-orders">Nincs aktív rendelés</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className='order-item'>
                <div className="order-item-thumb-stack">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.image ? `${url}/images/${item.image}` : assets.parcel_icon}
                      alt={item.name}
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="order-item-thumb-more">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="order-item-main-info">
                  <p className='order-item-food'>
                    {order.items.map((item, index) => {
                      const baseText = `${item.name} x ${item.quantity}`;
                      return index === order.items.length - 1 ? baseText : baseText + ', ';
                    })}
                  </p>

                  <div className="order-item-tags">
                    {order.items.some(item => item.exclusions && item.exclusions.length > 0) && (
                      <span className="exclusion-tag">
                        Nincs benne: {Array.from(new Set(order.items.flatMap(item => item.exclusions || []))).join(', ')}
                      </span>
                    )}
                    {order.items.some(item => item.additions && item.additions.length > 0) && (
                      <span className="addition-tag">
                        Kér rá: {Array.from(new Set(order.items.flatMap(item => item.additions || []))).join(', ')}
                      </span>
                    )}
                  </div>

                  <p className="order-item-customer-name">
                    <span className="label">Vevő:</span> {order.address.firstName + " " + order.address.lastName}
                  </p>

                  {order.note && order.note !== "" && (
                    <div className="order-item-note-box">
                      <span className="label" style={{ color: "inherit" }}>Megj.:</span> <span>{order.note}</span>
                    </div>
                  )}
                </div>

                <div className="order-item-meta">
                  <p>
                    <span className="label">Szünet:</span>
                    <span className="badge-break">{order.address.breakTime}. szünet</span>
                  </p>
                  <p><span className="label">Kód:</span> <span className="order-item-code">{order.randomCode}</span></p>
                  <p><span className="label">Fizetés:</span> {order.paymentMethod ? order.paymentMethod : (order.payment ? "Stripe" : "Utánvét")}</p>
                  <p className="order-item-date">{formatDate(order.date)}</p>
                </div>

                <div className="order-item-price-box">
                  <p className="order-price">{order.amount}{currency}</p>
                  <p className="order-items-count">{order.items.length} tétel</p>
                </div>

                {/* Ha le van mondva, csak egy piros taget mutatunk a folyamat helyett */}
                {order.status === "Vásárló által lemondva" || order.status === "Törölve" ? (
                  <div className='order-status-steps' style={{ justifyContent: 'center' }}>
                    <div className="status-step completed" style={{ flex: 1, textAlign: 'center' }}>
                      <span className="status-text" style={{ color: '#dc2626', fontWeight: 'bold' }}>✖ {order.status}</span>
                    </div>
                  </div>
                ) : (
                  <div className='order-status-steps'>
                    {["Felvettük rendelésed", "Készítés alatt", "Elkészült", "Átvéve"].map((status, index) => {
                      const currentStatusIndex = ["Felvettük rendelésed", "Készítés alatt", "Elkészült", "Átvéve"].indexOf(order.status);
                      const isCompleted = index <= currentStatusIndex;
                      const isNext = index === currentStatusIndex + 1;

                      return (
                        <div
                          key={index}
                          className={`status-step ${isCompleted ? 'completed' : ''} ${isNext ? 'next' : 'disabled'}`}
                          onClick={(e) => isNext ? statusHandler({ target: { value: status } }, order._id) : null}
                        >
                          <div className={`status-icon`}>
                            {isCompleted ? '✓' : ''}
                          </div>
                          <span className="status-text">{status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Order;