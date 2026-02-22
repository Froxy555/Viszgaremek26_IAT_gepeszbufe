import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Users from './pages/Users/Users'
import Dashboard from './pages/Dashboard/Dashboard'
import Edit from './pages/Edit/Edit'
import { assets, url } from './assets/assets'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login/Login';

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('adminToken') || "");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('admin-theme-dark') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      localStorage.setItem('admin-theme-dark', 'true');
    } else {
      document.documentElement.classList.remove('dark-mode');
      localStorage.setItem('admin-theme-dark', 'false');
    }
  }, [isDarkMode]);

  if (token !== "admin_logged_in") {
    return (
      <>
        <ToastContainer />
        <Login setToken={setToken} />
      </>
    )
  }

  return (
    <div className='app'>
      <ToastContainer />
      <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard url={url} />} />
          <Route path="/add" element={<Add url={url} />} />
          <Route path="/list" element={<List url={url} />} />
          <Route path="/orders" element={<Orders url={url} />} />
          <Route path="/users" element={<Users url={url} />} />
          <Route path="/edit" element={<Edit url={url} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App