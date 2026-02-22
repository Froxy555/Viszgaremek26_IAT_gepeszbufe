import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

// Lábléc komponens
const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        {/* Egyetlen letisztult sor a tartalmaknak asztali nézetben */}
        <h2 className="footer-logo">GépészBüfé</h2>

        <ul className="footer-links">
          <li onClick={() => { window.scrollTo(0, 0); navigate('/'); }}>Főoldal</li>
          <li onClick={() => navigate('/?section=menu')}>Menü</li>
          <li onClick={() => { window.scrollTo(0, 0); navigate('/myorders'); }}>Rendelések</li>
          <li onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Kapcsolat</li>
        </ul>

        <div className="footer-contact">
          <p>+36-20-123-4567</p>
          <p>gepeszbufe@gmail.com</p>
        </div>
      </div>

      {/* Szerzői jogi információ egy vékony elválasztó felett/alatt */}
      <hr />
      <p className="footer-copyright">13.A IAT 2026 © GepeszBufe - Minden jog fentartva.</p>
    </div>
  )
}

export default Footer
