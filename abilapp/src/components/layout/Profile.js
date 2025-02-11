import React from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../auth/authService';
import './layout.css';

function Profile({ onToggleTestContent }) {
  const user = AuthService.getCurrentUser();

  return (
    <div className="profile">
      {user ? (
        <>
          <div className="user-info" onClick={onToggleTestContent} style={{ cursor: 'pointer' }}>
            {user.profile && user.profile.avatar && <img src={user.profile.avatar} alt="Avatar" />}
            <span className="username">{user.profile.username}</span>
          </div>
          <button onClick={() => { AuthService.logout(); window.location.reload(); }}>Выход</button>
        </>
      ) : (
        <div className="auth-buttons">
          <Link to="/login">Вход</Link>
          <Link to="/register">Регистрация</Link>
        </div>
      )}
    </div>
  );
}

export default Profile;
