import React, { useState } from 'react';
import './Login.css';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const Login = ({ setToken }) => {
    const [pin, setPin] = useState('');

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
            </div>
        </div>
    )
}

export default Login;
