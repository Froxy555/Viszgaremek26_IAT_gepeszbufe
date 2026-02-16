import React from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/add' className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Termék hozzáadása</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Listázott termékek</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Rendelések</p>
        </NavLink>
        <NavLink to='/users' className="sidebar-option">
          <img src={assets.user_icon} alt="" />
          <p>Felhasználók</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
