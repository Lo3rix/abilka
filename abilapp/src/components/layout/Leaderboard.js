import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthService from '../auth/authService';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8000/api/leaderboard/')
      .then(response => {
        setLeaderboardData(response.data);
      })
      .catch(error => {
        console.error('Error fetching leaderboard data:', error);
      });
  }, []);

  // Функция для определения единиц измерения
  const getResultUnit = (testName) => {
    if (testName === 'Тест на реакцию') return 'мс';
    if (testName === 'AIM Тест') return 'очков';
    if (testName === 'Тест на скорость печати') return 'CPM';
    return ''; // Для других тестов
  };

  return (
    <div className="leaderboard-container">
      <h1>Таблица лидеров</h1>
      <h4>Результаты за последнюю неделю</h4>
      {Object.entries(leaderboardData).map(([testName, results]) => (
        <div key={testName} className="test-leaderboard">
          <h2>{testName}</h2>
          <div className="leaderboard-list">
            {results.map((result, index) => (
              <div
                key={index}
                className={`leaderboard-item ${
                  index === 0
                    ? 'first-place'
                    : index === 1
                    ? 'second-place'
                    : index === 2
                    ? 'third-place'
                    : ''
                }`}
              >
                <img
                  src={result.avatar}
                  alt={result.username}
                  className="leaderboard-avatar"
                />
                <div className="leaderboard-info">
                  <p className="leaderboard-username">{result.username}</p>
                  <hr className="separator" />
                  <p className="leaderboard-score">
                    {testName === 'Тест на реакцию'
                      ? `${result.average_time} ${getResultUnit(testName)}`
                      : `${result.score} ${getResultUnit(testName)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;