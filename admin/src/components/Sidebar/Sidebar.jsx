import React from 'react'
import './Sidebar.css'
import { NavLink } from 'react-router-dom'
import {
  IoSpeedometerOutline,
  IoAddCircleOutline,
  IoListOutline,
  IoBriefcaseOutline,
  IoPeopleOutline
} from "react-icons/io5";

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/dashboard' className="sidebar-option">
          <IoSpeedometerOutline className="sidebar-icon" />
          <p>Vezérlőpult</p>
        </NavLink>
        <NavLink to='/add' className="sidebar-option">
          <IoAddCircleOutline className="sidebar-icon" />
          <p>Termék hozzáadása</p>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
          <IoListOutline className="sidebar-icon" />
          <p>Listázott termékek</p>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <IoBriefcaseOutline className="sidebar-icon" />
          <p>Rendelések</p>
        </NavLink>
        <NavLink to='/users' className="sidebar-option">
          <IoPeopleOutline className="sidebar-icon" />
          <p>Felhasználók</p>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
