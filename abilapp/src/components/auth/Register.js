import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from './authService';
import './register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await AuthService.register(username, email, password, avatar);
      navigate('/');
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          (error.response.data.detail || Object.values(error.response.data).join(', '))) ||
        error.message ||
        error.toString();

      setMessage(resMessage);
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Регистрация</h2>
        <form onSubmit={handleRegister}>
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div>
            <label htmlFor="avatar">Аватар</label>
            <input
              type="file"
              name="avatar"
              onChange={(e) => setAvatar(e.target.files[0])}
            />
          </div>
          <div>
            <button disabled={loading}>
              {loading ? 'Загрузка...' : 'Регистрация'}
            </button>
          </div>
          {message && <div className="error-message">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default Register;
