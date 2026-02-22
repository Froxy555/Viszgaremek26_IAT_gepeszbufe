import React, { useContext, useEffect, useState } from 'react';
import './Settings.css';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// Profil beállítások oldal komponens
const Settings = () => {
  const { profileName, setProfileName, profileAvatar, setProfileAvatar, url, token, loadProfile, t, language, setLanguage } = useContext(StoreContext);

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
      <h2>{t('settings.title')}</h2>

      <div className="settings-layout">
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
              <p>{t('settings.profile_pic')}</p>
              <label className="settings-upload-button">
                {t('settings.upload')}
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>
              <p className="settings-hint">{t('settings.upload_hint')}</p>
            </div>
          </div>

          <div className="settings-field-group">
            <label>{t('settings.name_label')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('settings.name_label')}
            />
          </div>

          <div className="settings-field-group settings-password-group">
            <label>{t('settings.password_title')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('settings.password_current')}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('settings.password_new')}
            />
            <p className="settings-hint">
              {t('settings.password_hint')}
            </p>
          </div>

          <button className="settings-save" type="submit">{t('settings.save')}</button>
        </form>

        <div className="settings-card">
          <div className="settings-field-group">
            <label>{t('settings.language_title')}</label>
            <div className="language-options">
              <div
                className={`language-option ${language === 'hu' ? 'active' : ''}`}
                onClick={() => setLanguage('hu')}
              >
                <span>🇭🇺</span> {t('settings.language_hu')}
              </div>
              <div
                className={`language-option ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                <span>🇬🇧</span> {t('settings.language_en')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
