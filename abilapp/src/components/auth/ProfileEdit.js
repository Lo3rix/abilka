import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from './authService';
import './auth.css';

const ProfileEdit = ({ user, setUser }) => {
  const [username, setUsername] = useState(user.profile.username);
  const [email, setEmail] = useState(user.profile.email);
  const [avatar, setAvatar] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [createdAt, setCreatedAt] = useState(user.profile.created_at);
  const [updatedAt, setUpdatedAt] = useState(user.profile.updated_at);
  const [message, setMessage] = useState('');
  const [isEmailEditVisible, setIsEmailEditVisible] = useState(false);
  const [isPasswordEditVisible, setIsPasswordEditVisible] = useState(false);

  useEffect(() => {
    setUsername(user.profile.username);
    setEmail(user.profile.email);
    setCreatedAt(user.profile.created_at);
    setUpdatedAt(user.profile.updated_at);
  }, [user]);

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmNewPasswordChange = (e) => {
    setConfirmNewPassword(e.target.value);
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('username', username);
    if (isEmailEditVisible) {
      formData.append('email', email);
      formData.append('current_password', currentPassword);
    }
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const response = await axios.put('http://localhost:8000/api/user/', formData, {
        headers: {
          'Authorization': `Bearer ${user.access}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      const updatedUser = { ...user, profile: response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage('Profile updated successfully.');
      setIsEmailEditVisible(false);
      setCurrentPassword('');
    } catch (error) {
      console.error('Error updating profile:', error.response ? error.response.data : error.message);
      setMessage(`Error updating profile: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setMessage('Новый пароль и подтверждение пароля не совпадают.');
      return;
    }

    try {
      const response = await axios.put('http://localhost:8000/api/user/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      }, {
        headers: {
          'Authorization': `Bearer ${user.access}`,
        }
      });

      setMessage('Password updated successfully.');
      setIsPasswordEditVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error.response ? error.response.data : error.message);
      setMessage(`Error updating password: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  return (
    <div className="profile-edit">
      <h2>Изменить профиль</h2>
      <div>
        <img
          src={avatar ? URL.createObjectURL(avatar) : user.profile.avatar}
          alt="Avatar"
          className="avatar"
          onClick={() => document.getElementById('avatarInput').click()}
        />
        <input
          type="file"
          id="avatarInput"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />
      </div>
      <div>
        <label htmlFor="username">Никнейм:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={handleUsernameChange}
        />
      </div>
      <div>
        {isEmailEditVisible ? (
          <>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
            />
            <label htmlFor="currentPassword">Текущий пароль:</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
            />
            <button onClick={() => setIsEmailEditVisible(false)}>Отменить</button>
          </>
        ) : (
          <div>
            <p>Email: {email} <button onClick={() => setIsEmailEditVisible(true)}>Изменить Email</button></p>
          </div>
        )}
      </div>
      <div>
        {isPasswordEditVisible ? (
          <>
            <label htmlFor="currentPassword">Текущий пароль:</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
            />
            <label htmlFor="newPassword">Новый пароль:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={handleNewPasswordChange}
            />
            <label htmlFor="confirmNewPassword">Подтвердите новый пароль:</label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={handleConfirmNewPasswordChange}
            />
            <button onClick={handleChangePassword}>Сохранить пароль</button>
            <button onClick={() => setIsPasswordEditVisible(false)}>Отменить</button>
          </>
        ) : (
          <p>Пароль: <button onClick={() => setIsPasswordEditVisible(true)}>Изменить пароль</button></p>
        )}
      </div>
      <div>
        <p>Дата создания: {createdAt ? new Date(createdAt).toLocaleString() : 'Неизвестно'}</p>
        <p>Последнее обновление: {updatedAt ? new Date(updatedAt).toLocaleString() : 'Неизвестно'}</p>
      </div>
      <button onClick={handleSaveProfile}>Сохранить</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ProfileEdit;
