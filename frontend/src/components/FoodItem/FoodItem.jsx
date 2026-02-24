import React, { useContext, useState } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext';

// Étel kártya komponens
const FoodItem = ({ image, name, price, desc, id, available = true, rating = 5 }) => {
    const context = useContext(StoreContext) || {};
    const {
        cartItems = {},
        addToCart = () => { },
        removeFromCart = () => { },
        url = '',
        currency = ''
    } = context;

    const [isAnimating, setIsAnimating] = useState(false);

    // Kosárba tétel kezelése
    const handleAddToCart = () => {
        addToCart(id);

        // Animáció elindítása
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
    };

    // Kosárból eltávolítás kezelése
    const handleRemoveFromCart = () => {
        removeFromCart(id);
    };

    // Aktuális darabszám lekérése a kosárból
    const getCartCount = () => {
        if (!cartItems) return 0;
        return cartItems[id] || 0;
    };

    // Csillagok renderelése az értékeléshez
    const renderStars = () => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} style={{ color: i < rating ? '#ff9529' : '#dcdcdc', fontSize: '18px' }}>
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <div className='food-item'>
            {/* Étel kép konténer */}
            <div className='food-item-img-container'>
                <img className={`food-item-image ${!available ? 'grayscale' : ''}`} src={url + "/images/" + image} alt="" />

                {!available && (
                    // Elfogyott jelzés
                    <div className="sold-out-overlay">
                        <p>Elfogyott</p>
                    </div>
                )}
            </div>

            {/* Étel információk */}
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <div className="rating-stars">
                        {renderStars()}
                    </div>
                </div>
                <p className="food-item-desc">{desc}</p>
                <div className="food-item-price-row">
                    <p className="food-item-price-bottom">{price}{currency}</p>

                    {available && (
                        !getCartCount()
                            ? <div className={`food-item-add ${isAnimating ? 'pop-anim' : ''}`} onClick={handleAddToCart}>
                                <span>+</span>
                            </div>
                            : <div className={`food-item-counter-modern ${isAnimating ? 'pop-anim' : ''}`}>
                                <div className="counter-btn minus" onClick={handleRemoveFromCart}>-</div>
                                <p>{getCartCount()}</p>
                                <div className="counter-btn plus" onClick={handleAddToCart}>+</div>
                            </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FoodItem