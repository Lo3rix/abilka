import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../auth/Login';
import authService from '../auth/authService';
import './layout.css';

function Navbar({ user, setUser }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.reload();
  };

  const handleNavigateToTests = () => {
    navigate('/tests');
  };

  const handleNavigateToLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleNavigateToProfile = () => {
    navigate('/profile');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button onClick={handleNavigateToTests} className="navbar-button">
            Тесты
          </button>
          <button onClick={handleNavigateToLeaderboard} className="navbar-button">
            Таблица лидеров
          </button>
        </div>
        <div className="navbar-right">
          {user ? (
            <>
              <div
                className="user-info"
                onClick={handleNavigateToProfile}
                style={{ cursor: 'pointer' }}
              >
                {user.profile.avatar && (
                  <img
                    src={user.profile.avatar}
                    alt="Avatar"
                    className="profile-avatar"
                  />
                )}
                <span className="username">{user.profile.username}</span>
              </div>
              <button onClick={handleLogout} className="auth-button">
                Выход
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="auth-button"
            >
              Вход
            </button>
          )}
        </div>
      </nav>
      {isLoginModalOpen && <Login onClose={() => setIsLoginModalOpen(false)} />}
    </>
  );
}

export default Navbar;
