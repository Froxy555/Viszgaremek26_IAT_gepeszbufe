import React, { useState } from 'react';
import './Login.css';
import { assets, url } from '../../assets/assets';
import { toast } from 'react-toastify';
import axios from 'axios';

const Login = ({ setToken }) => {
    const [pin, setPin] = useState('');
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestName, setRequestName] = useState('');
    const [requestEmail, setRequestEmail] = useState('');

    const onSubmitHandler = (e) => {
        e.preventDefault();
        if (pin === '1111') {
            setToken('admin_logged_in');
            localStorage.setItem('adminToken', 'admin_logged_in');
            toast.success("Sikeres bejelentkezés!");
        } else {
            toast.error("Hibás PIN kód!");
            setPin('');
        }
    }

    const onRequestAccessHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${url}/api/user/request-admin-access`, {
                name: requestName,
                email: requestEmail
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setShowRequestModal(false);
                setRequestName('');
                setRequestEmail('');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Hiba történt a kérelem elküldésekor.");
        }
    }

    return (
        <div className='admin-login'>
            <div className="admin-login-container">
                <img src={assets.logo} alt="Logo" className="admin-login-logo" />
                <h2>Admin Panel</h2>
                <form onSubmit={onSubmitHandler}>
                    <p>Kérlek add meg a 4 jegyű PIN kódot:</p>
                    <input
                        type="password"
                        maxLength="4"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        required
                        autoFocus
                    />
                    <button type="submit">Belépés</button>
                </form>
                <div className="request-access-container">
                    <button className="request-access-btn" onClick={() => setShowRequestModal(true)}>
                        Hozzáférés kérése
                    </button>
                </div>
            </div>

            {showRequestModal && (
                <div className="request-modal-overlay">
                    <div className="request-modal">
                        <h3>Hozzáférési kérelem</h3>
                        <p>Kérlek add meg a neved és az emailedet!</p>
                        <form onSubmit={onRequestAccessHandler}>
                            <input 
                                type="text" 
                                placeholder="Név" 
                                value={requestName} 
                                onChange={(e) => setRequestName(e.target.value)} 
                                required 
                            />
                            <input 
                                type="email" 
                                placeholder="Email cím" 
                                value={requestEmail} 
                                onChange={(e) => setRequestEmail(e.target.value)} 
                                required 
                            />
                            <div className="request-modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowRequestModal(false)}>Mégsem</button>
                                <button type="submit" className="submit-btn">Kérelem küldése</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Login;
