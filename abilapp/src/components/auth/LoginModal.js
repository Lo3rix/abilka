import React, { useState } from 'react';
import AuthService from './authService';
import './auth.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AuthService.login(username, password);
      setLoading(false);
      onLoginSuccess(); // Обновить данные пользователя
      onClose(); // Закрыть модальное окно
    } catch (error) {
      const resMessage =
        (error.response &&
         error.response.data &&
         error.response.data.detail) ||
        error.response.data ||
        error.toString();

      setMessage(resMessage);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Вход</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
          {message && <div className="error-message">{message}</div>}
        </form>
        <button className="close-button" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default LoginModal;