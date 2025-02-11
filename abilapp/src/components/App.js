import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthService from './auth/authService';
import Navbar from './layout/Navbar';
import TestContent from './layout/TestContent';
import ProfileEdit from './auth/ProfileEdit';
import Register from './auth/Register';
import Leaderboard from './layout/Leaderboard';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
  const [activeContent, setActiveContent] = useState('home');

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleShowTests = () => {
    setActiveContent('tests');
  };

  const handleShowProfile = () => {
    setActiveContent('profile');
  };

  const handleLogoClick = () => {
    setActiveContent('home');
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="App">
        <Navbar
          user={currentUser}
          setUser={setCurrentUser}
          onToggleTestContent={handleShowProfile}
          onShowTestContent={handleShowTests}
          onLogoClick={handleLogoClick}
        />

        <div className="main-content">
        <div
          className="logo-container"
          onClick={handleLogoClick}
        >
          <span className="logo-link">ABILKA</span>
        </div>
          <Routes>
            <Route path="/" element={<p>Добро пожаловать на сайт Abilka! Выберите пункт в навигации.</p>} />
            <Route path="/tests" element={<TestContent />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route
              path="/profile"
              element={currentUser ? <ProfileEdit user={currentUser} setUser={setCurrentUser} /> : <Navigate to="/" />}
            />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
