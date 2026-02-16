import React, { useContext, useEffect, useState } from 'react';
import './Settings.css';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// Profil beállítások oldal komponens
const Settings = () => {
  const { profileName, setProfileName, profileAvatar, setProfileAvatar, url, token, loadProfile } = useContext(StoreContext);

  // Helyi állapotok az űrlap mezőinek
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Adatok inicializálása a kontextusból induláskor
  useEffect(() => {
    setName(profileName || '');
    setAvatarPreview(profileAvatar || '');
  }, [profileName, profileAvatar]);

  // Profilkép változás kezelése (kép konvertálása DataURL formátumba)
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result.toString();
      setAvatarPreview(dataUrl);
      setProfileAvatar(dataUrl);
      localStorage.setItem('profileAvatar', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Profil adatok mentése a szerverre
  const handleSave = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('A profil módosításához be kell jelentkezni.');
      return;
    }

    try {
      const response = await axios.post(
        url + '/api/user/update-profile',
        {
          name,
          avatarUrl: avatarPreview,
          currentPassword,
          newPassword,
        },
        {
          headers: { token },
        }
      );

      if (!response.data.success) {
        toast.error(response.data.message || 'Nem sikerült frissíteni a profilt.');
        return;
      }

      // Helyi állapotok és localStorage frissítése sikeres mentés után
      const updatedUser = response.data.user;
      if (updatedUser) {
        setProfileName(updatedUser.name || '');
        setProfileAvatar(updatedUser.avatarUrl || '');
        localStorage.setItem('profileName', updatedUser.name || '');
        localStorage.setItem('profileAvatar', updatedUser.avatarUrl || '');
      }

      // Visszajelzés a felhasználónak
      if (newPassword) {
        toast.success('Profil és jelszó frissítve.');
      } else {
        toast.success('Profil frissítve.');
      }

      setCurrentPassword('');
      setNewPassword('');

      // Profil adatok újratöltése a kontextusban
      await loadProfile(token);
    } catch (err) {
      console.error(err);
      toast.error('Váratlan hiba történt a profil frissítésekor.');
    }
  };

  return (
    <div className="settings section animate-fade-up">
      <h2>Profil beállítások</h2>
      <form className="settings-card" onSubmit={handleSave}>
        <div className="settings-avatar-row">
          <div className="settings-avatar-preview">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profilkép előnézet" />
            ) : (
              <div className="settings-avatar-placeholder">KB</div>
            )}
          </div>
          <div className="settings-avatar-actions">
            <p>Profilkép</p>
            <label className="settings-upload-button">
              Kép feltöltése
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
            <p className="settings-hint">Ajánlott: 1:1 arányú (négyzet) kép.</p>
          </div>
        </div>

        <div className="settings-field-group">
          <label>Megjelenített név</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Név"
          />
        </div>

        <div className="settings-field-group settings-password-group">
          <label>Jelszó módosítása</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Jelenlegi jelszó"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Új jelszó"
          />
          <p className="settings-hint">
            A jelszó módosítás a háttérben is frissül. A változások új böngészőben is érvényesek lesznek.
          </p>
        </div>

        <button className="settings-save" type="submit">Mentés</button>
      </form>
    </div>
  );
};

export default Settings;
