import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="" />

      <div className="navbar-right">
        <button
          className='navbar-icon-button'
          onClick={() => setIsDarkMode(!isDarkMode)}
          type="button"
          title={isDarkMode ? "Világos Mód" : "Sötét Mód"}
        >
          <span style={{ fontSize: '20px', display: 'flex', userSelect: 'none' }}>
            {isDarkMode ? '☀️' : '🌙'}
          </span>
        </button>
        <img className='profile' src={assets.profile_image} alt="" />
      </div>
    </div>
  )
}

export default Navbar
