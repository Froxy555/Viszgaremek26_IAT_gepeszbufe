import React, { useContext } from 'react';
import './MobileCartButton.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileCartButton = () => {
    const { cartItems, getTotalCartAmount } = useContext(StoreContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Számoljuk össze a kosárban lévő összes terméket
    const totalItems = Object.values(cartItems).reduce((acc, qty) => acc + qty, 0);

    // Ne jelenjen meg, ha a kosár üres, vagy ha épp a kosár/rendelés oldalon vagyunk
    const isHidden =
        totalItems === 0 ||
        location.pathname === '/cart' ||
        location.pathname === '/order' ||
        location.pathname.startsWith('/order-success');

    if (isHidden) return null;

    return (
        <div className="mobile-cart-button" onClick={() => navigate('/cart')}>
            <div className="mobile-cart-icon-container">
                <img src={assets.basket_icon} alt="Kosár" />
                <span className="mobile-cart-badge">{totalItems}</span>
            </div>
            <div className="mobile-cart-amount">
                {getTotalCartAmount()} Ft
            </div>
        </div>
    );
};

export default MobileCartButton;
