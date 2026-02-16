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
  const { getTotalCartAmount, token, setToken, setSearchTerm, profileAvatar } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

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
    const el = document.getElementById('footer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
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
    if (location.pathname === '/' || location.pathname === '/home') {
      setMenu('home');
    } else if (location.pathname === '/myorders') {
      setMenu('mob-app');
    } else if (location.pathname === '/cart') {
      setMenu('');
    }
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Ellenőrzés: főoldalon vagyunk-e
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  return (
    <>
      <div className={`navbar ${isMobileMenuOpen ? 'navbar-open' : ''}`}>
        <Link to='/' onClick={() => { setMenu("home"); setIsMobileMenuOpen(false); }}>
          <img className='logo' src={assets.logo} alt="Grillo Logo" />
        </Link>

        <ul className={`navbar-menu ${isMobileMenuOpen ? 'navbar-menu-mobile-open' : ''}`}>
          <Link
            to="/"
            onClick={() => { setMenu("home"); setIsMobileMenuOpen(false); }}
            className={`${menu === "home" ? "active" : ""}`}
          >
            főoldal
          </Link>
          <a
            href='#explore-menu'
            onClick={handleMenuSectionClick}
            className={`${menu === "menu" ? "active" : ""}`}
          >
            menü
          </a>
          <Link
            to='/myorders'
            onClick={() => { setMenu("mob-app"); setIsMobileMenuOpen(false); }}
            className={`${menu === "mob-app" ? "active" : ""}`}
          >
            rendelések
          </Link>
          <a
            href='#footer'
            onClick={handleContactClick}
            className={`${menu === "contact" ? "active" : ""}`}
          >
            kapcsolat
          </a>
        </ul>

        <div className="navbar-right">
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
            <button onClick={() => setShowLogin(true)}>Bejelentkezés</button>
          ) : (
            <div
              className={`navbar-profile ${showProfileMenu ? 'open' : ''}`}
              onClick={handleProfileClick}
            >
              <img src={profileAvatar || assets.profile_icon} alt="Profil" />
              <ul className='navbar-profile-dropdown' onClick={handleProfileMenuClick}>
                <li onClick={handleOrdersClick}>
                  <img src={assets.bag_icon} alt="" />
                  <p>Rendelések</p>
                </li>
                <hr />
                <li onClick={handleSettingsClick}>
                  <img src={assets.selector_icon} alt="" />
                  <p>Beállítások</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <img src={assets.logout_icon} alt="" />
                  <p>Kijelentkezés</p>
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