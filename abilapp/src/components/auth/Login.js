import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from './authService';
import './auth.css';

const Login = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AuthService.login(username, password);
      window.location.reload();
    } catch (error) {
      const resMessage =
        (error.response && error.response.data && error.response.data.detail) ||
        error.response.data ||
        error.toString();

      setMessage(resMessage);
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'auth-container') {
      onClose();
    }
  };

  return (
    <div className="auth-container" onClick={handleOverlayClick}>
      <div className="auth-form">
        <h2>Вход</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
            />
            <label htmlFor="rememberMe">Запомнить меня</label>
          </div>
          <div>
            <button disabled={loading}>
              {loading ? 'Загрузка...' : 'Вход'}
            </button>
          </div>
          {message && <div className="error-message">{message}</div>}
        </form>
        <p>
          <Link
            to="/register"
            style={{ color: '#black', textDecoration: 'none' }}
            onClick={onClose}
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;