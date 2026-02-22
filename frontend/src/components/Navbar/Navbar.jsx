import React, { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'

// Navigációs sáv komponens
const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { getTotalCartAmount, token, setToken, setSearchTerm, profileAvatar, t } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Sötét mód állapota mentve a gép memóriájába (localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme-dark') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('theme-dark', 'true');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('theme-dark', 'false');
    }
  }, [isDarkMode]);

  // Kijelentkezés folyamata
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setShowProfileMenu(false);
    navigate('/')
  }

  // Ugrás a kosárhoz
  const handleCartClick = () => {
    navigate('/cart');
    setIsMobileMenuOpen(false);
  }

  // Mobil menü megnyitása/bezárása
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setShowProfileMenu(false);
  }

  // Menü pontra kattintás kezelése
  const handleMenuSectionClick = (e) => {
    e.preventDefault();
    setMenu('menu');
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/?section=menu');
    } else {
      window.history.replaceState(null, '', '/?section=menu');
      const el = document.getElementById('explore-menu');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Kapcsolat menüpont kezelése
  const handleContactClick = (e) => {
    e.preventDefault();
    setMenu('contact');
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/?section=contact');
    } else {
      window.history.replaceState(null, '', '/?section=contact');
      const el = document.getElementById('footer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // Keresés gomb kezelése
  const handleSearchClick = () => {
    setIsMobileMenuOpen(false);
    // menjünk a menü szekcióhoz, és fókuszáljuk a keresőmezőt
    const focusInput = () => {
      const input = document.getElementById('food-search-input');
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
        return true;
      }
      return false;
    };

    if (location.pathname !== '/') {
      navigate('/?section=menu');
      // kis késleltetéssel próbáljuk fókuszálni, miután a Home betölt
      setTimeout(() => {
        focusInput();
      }, 400);
    } else {
      if (!focusInput()) {
        const el = document.getElementById('food-display');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }

  // Profil menü megjelenítése
  const handleProfileClick = (e) => {
    e.stopPropagation();
    setShowProfileMenu((prev) => !prev);
  }

  // Profil menü elemen belüli kattintás (ne zárja be azonnal)
  const handleProfileMenuClick = (e) => {
    e.stopPropagation();
  }

  // Rendeléseim oldalra navigálás
  const handleOrdersClick = () => {
    navigate('/myorders');
    setShowProfileMenu(false);
  }

  // Beállítások oldalra navigálás
  const handleSettingsClick = () => {
    navigate('/settings');
    setShowProfileMenu(false);
  }

  // Menü bezárása kattintásra (kívülre)
  useEffect(() => {
    const closeMenus = () => {
      setShowProfileMenu(false);
    };

    if (showProfileMenu) {
      document.addEventListener('click', closeMenus);
    }

    return () => {
      document.removeEventListener('click', closeMenus);
    };
  }, [showProfileMenu]);

  // Aktív menüpont beállítása az URL alapján
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');

    if (location.pathname === '/' || location.pathname === '/home') {
      if (section === 'menu') setMenu('menu');
      else if (section === 'contact') setMenu('contact');
      else setMenu('home');
    } else if (location.pathname === '/myorders') {
      setMenu('mob-app');
    } else {
      setMenu('');
    }

    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname, location.search]);

  // Ellenőrzés: főoldalon vagyunk-e
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <>
      <div className={`navbar ${isMobileMenuOpen ? 'navbar-open' : ''}`}>
        <Link to='/' onClick={() => { setMenu("home"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img className='logo' src={assets.logo} alt="Grillo Logo" />
        </Link>

        <ul className={`navbar-menu ${isMobileMenuOpen ? 'navbar-menu-mobile-open' : ''}`}>
          <Link
            to="/"
            onClick={() => { setMenu("home"); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`${menu === "home" ? "active" : ""}`}
          >
            {t('nav.home')}
          </Link>
          <Link
            to='/?section=menu'
            onClick={handleMenuSectionClick}
            className={`${menu === "menu" ? "active" : ""}`}
          >
            {t('nav.menu')}
          </Link>
          <Link
            to='/myorders'
            onClick={() => { setMenu("mob-app"); setIsMobileMenuOpen(false); }}
            className={`${menu === "mob-app" ? "active" : ""}`}
          >
            {t('nav.orders')}
          </Link>
          <Link
            to='/?section=contact'
            onClick={handleContactClick}
            className={`${menu === "contact" ? "active" : ""}`}
          >
            {t('nav.contact')}
          </Link>
        </ul>

        <div className="navbar-right">
          <button
            className='navbar-icon-button'
            onClick={() => setIsDarkMode(!isDarkMode)}
            type="button"
            aria-label="Sötét mód váltása"
            title={isDarkMode ? "Világos Mód" : "Sötét Mód"}
          >
            <span style={{ fontSize: '20px', display: 'flex', userSelect: 'none' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </span>
          </button>

          <div
            className={`navbar-hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <button
            className='navbar-icon-button'
            onClick={handleSearchClick}
            type="button"
            aria-label="Keresés"
          >
            <img src={assets.search_icon} alt="" className='navbar-icon' />
          </button>

          <Link to='/cart' className='navbar-search-icon' aria-label="Kosár">
            <img src={assets.basket_icon} alt="" />
            {getTotalCartAmount() > 0 && <div className="dot"></div>}
          </Link>

          {!token ? (
            <button className="navbar-login-button" onClick={() => setShowLogin(true)}>{t('nav.login')}</button>
          ) : (
            <div
              className={`navbar-profile ${showProfileMenu ? 'open' : ''}`}
              onClick={handleProfileClick}
            >
              <img src={profileAvatar || assets.profile_icon} alt="Profil" referrerPolicy="no-referrer" />
              <ul className='navbar-profile-dropdown' onClick={handleProfileMenuClick}>
                <li onClick={handleOrdersClick}>
                  <img src={assets.bag_icon} alt="" />
                  <p>{t('nav.orders')}</p>
                </li>
                <hr />
                <li onClick={handleSettingsClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF4C24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dropdown-icon-svg">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <p>{t('nav.settings')}</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="" />
                  <p>{t('nav.logout')}</p>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>


    </>
  )
}

export default Navbar