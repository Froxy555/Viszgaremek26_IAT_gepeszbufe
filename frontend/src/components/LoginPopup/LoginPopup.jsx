import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Eye, EyeOff } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'

// Bejelentkező/Regisztráló felugró ablak komponens
const LoginPopup = ({ setShowLogin }) => {
    const { setToken, url, loadCartData, setProfileName, setProfileAvatar } = useContext(StoreContext)

    // Lehetséges állapotok: "Bejelentkezés", "Regisztráció", "Email megerősítés"
    const [currState, setCurrState] = useState("Regisztráció");
    const [showPassword, setShowPassword] = useState(false);

    // Űrlap adatok állapota
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        otp: ""
    })

    // Input mezők változásának kezelése
    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    // Hitelesítési folyamat kezelése (Regisztráció lekérés -> OTP -> Regisztráció vagy Bejelentkezés)
    const onAuthSubmit = async (e) => {
        e.preventDefault();

        try {
            if (currState === "Regisztráció") {
                // Először csak elküldjük az emailt, és kérünk egy OTP-t 
                const response = await axios.post(url + "/api/user/send-otp", { email: data.email });
                if (response.data.success) {
                    toast.success(response.data.message);
                    setCurrState("Email megerősítés");
                } else {
                    toast.error(response.data.message);
                }
            }
            else if (currState === "Email megerősítés") {
                // Regisztráció megkísérlése az OTP kóddal
                const response = await axios.post(url + "/api/user/register", data);
                handleAuthResponse(response);
            }
            else if (currState === "Bejelentkezés") {
                // Sima bejelentkezés
                const response = await axios.post(url + "/api/user/login", data);
                handleAuthResponse(response);
            }
        } catch (error) {
            console.error("Hálózati hiba vagy backend probléma:", error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Valami hiba történt a szerverrel való kommunikáció során.");
            }
        }
    }

    // Közös válaszkezelő bejelentkezéshez és regisztrációhoz
    const handleAuthResponse = (response) => {
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
            toast.success("Sikeres bejelentkezés!");
            setShowLogin(false);
        } else {
            toast.error(response.data.message);
        }
    }

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Elküldjük a kapott hozzáférési tokent a saját backendünknek
                const response = await axios.post(url + "/api/user/google", { token: tokenResponse.access_token });
                handleAuthResponse(response);
            } catch (error) {
                console.error("Hiba a Google hitelesítés végső szakaszában:", error);
                toast.error("Hiba történt a Google bejelentkezéskor.");
            }
        },
        onError: () => {
            toast.error("Sikertelen Google bejelentkezés.");
        }
    });

    return (
        <div className='login-popup'>
            <form onSubmit={onAuthSubmit} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="Bezárás" />
                </div>

                <div className="login-popup-inputs">
                    {/* Alap mezők Regisztrációnál és Bejelentkezésnél */}
                    {currState !== "Email megerősítés" && (
                        <>
                            {currState === "Regisztráció" && (
                                <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Teljes neved' required />
                            )}
                            <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email címed' required />

                            <div className="password-input-container">
                                <input
                                    name='password'
                                    onChange={onChangeHandler}
                                    value={data.password}
                                    type={showPassword ? "text" : "password"}
                                    placeholder='Jelszó'
                                    required
                                />
                                <button type="button" className="password-toggle-btn" onClick={togglePasswordVisibility}>
                                    {showPassword ? <EyeOff size={20} color="#777" /> : <Eye size={20} color="#777" />}
                                </button>
                            </div>
                        </>
                    )}

                    {/* OTP Mező */}
                    {currState === "Email megerősítés" && (
                        <>
                            <p className="otp-info-text">
                                Elküldtünk egy 4 jegyű kódot a(z) <b>{data.email}</b> címre. Nézd meg a SPAM mappát is!
                            </p>
                            <input
                                name='otp'
                                onChange={onChangeHandler}
                                value={data.otp}
                                type="text"
                                placeholder='4 jegyű kód (pl. 1234)'
                                maxLength={4}
                                required
                            />
                        </>
                    )}
                </div>

                <button type="submit" className="login-submit-button">
                    {currState === "Bejelentkezés" ? "Bejelentkezés" :
                        currState === "Email megerősítés" ? "Megerősítés és Regisztráció" : "Fiók létrehozása"}
                </button>

                {/* Feltételek elfogadása (CSAK REGISZTRÁCIÓKOR) */}
                {currState === "Regisztráció" && (
                    <div className="login-popup-condition">
                        <input type="checkbox" required />
                        <p>Folytatva egyetértek a <span>használati feltételekkel</span> és az <span>adatvédelmi irányelvekkel</span>.</p>
                    </div>
                )}

                {/* Váltás állapotok között (bejelentkezés / reg) */}
                {currState !== "Email megerősítés" && (
                    <>
                        <div className="login-popup-separator">
                            <span>vagy</span>
                        </div>

                        <button type="button" className="google-login-button" onClick={handleGoogleLogin}>
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Bejelentkezés Google fiókkal
                        </button>

                        <div className="login-popup-footer">
                            {currState === "Bejelentkezés"
                                ? <p>Nincs még fiókod? <span onClick={() => setCurrState('Regisztráció')}>Regisztrálj!</span></p>
                                : <p>Van már fiókod? <span onClick={() => setCurrState('Bejelentkezés')}>Jelentkezz be!</span></p>
                            }
                        </div>
                    </>
                )}
            </form>
        </div>
    )
}

export default LoginPopup