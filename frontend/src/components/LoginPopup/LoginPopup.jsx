import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

// Bejelentkező/Regisztráló felugró ablak komponens
const LoginPopup = ({ setShowLogin }) => {
    const { setToken, url, loadCartData, setProfileName, setProfileAvatar } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Regisztráció");

    // Űrlap adatok állapota
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    // Input mezők változásának kezelése
    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    // Bejelentkezés vagy Regisztráció kezelése
    const onLogin = async (e) => {
        e.preventDefault()

        let new_url = url;
        if (currState === "Bejelentkezés") {
            new_url += "/api/user/login";
        }
        else {
            new_url += "/api/user/register"
        }
        const response = await axios.post(new_url, data);
        if (response.data.success) {
            const { token, user } = response.data;
            setToken(token);
            localStorage.setItem("token", token);
            loadCartData({ token });

            // Felhasználói profil adatok mentése
            if (user) {
                setProfileName(user.name || '');
                setProfileAvatar(user.avatarUrl || '');
                localStorage.setItem('profileName', user.name || '');
                localStorage.setItem('profileAvatar', user.avatarUrl || '');
            }

            setShowLogin(false);
        } else {
            toast.error(response.data.message);
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Regisztráció" ? <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Név' required /> : <></>}
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email' />
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Jelszó' required />
                </div>
                <button type="submit" className="login-submit-button">{currState === "Bejelentkezés" ? "Bejelentkezés" : "Fiók létrehozása"}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" name="" id="" required />
                    <p>Folytatva egyetértek a használati feltételekkel és az adatvédelmi irányelvekkel.</p>
                </div>
                {/* Váltás bejelentkezés és regisztráció között */}
                {currState === "Bejelentkezés"
                    ? <p>Nincs még fiókod? <span onClick={() => setCurrState('Regisztráció')}>Fiók létrehozása</span></p>
                    : <p>Van már fiókod? <span onClick={() => setCurrState('Bejelentkezés')}>Bejelentkezés</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup