import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthService from '../auth/authService';
import './AimTest.css';

const AimTest = ({ title, description, onResultSave }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ top: '50%', left: '50%' });
  const timerRef = useRef(null);

  useEffect(() => {
    if (isStarted) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted]);

  useEffect(() => {
    if (misses >= 3) {
      setIsStarted(false);
      clearInterval(timerRef.current);
      alert(`Игра окончена! Ваш счет: ${score}`);
      saveResult(score, time);
    }
  }, [misses, score, time]);

  const startGame = () => {
    setIsStarted(true);
    setScore(0);
    setTime(0);
    setMisses(0);
    moveTarget();
  };

  const moveTarget = () => {
    const top = Math.random() * 90 + '%';
    const left = Math.random() * 90 + '%';
    setTargetPosition({ top, left });
  };

  const handleTargetClick = () => {
    setScore((prevScore) => prevScore + 1);
    moveTarget();
  };

  const handleMiss = () => {
    setMisses((prevMisses) => prevMisses + 1);
    moveTarget();
  };

  const saveResult = (score, time) => {
    const user = AuthService.getCurrentUser();
    if (user && user.access) {
      axios.post('http://localhost:8000/api/results/', {
        test: 2,
        average_time: time,
        score: score
      }, {
        headers: {
          'Authorization': `Bearer ${user.access}`
        }
      })
      .then(() => {
        onResultSave();
      })
      .catch(error => {
        console.error('Ошибка при сохранении результата:', error.response ? error.response.data : error.message);
      });
    } else {
      alert("Вы не авторизованы, результаты не будут сохранены.");
    }
  };

  return (
    <div className="aim-test">
      <h2>{title}</h2>
      <p className="test-description">{description}</p>
      {!isStarted ? (
        <button onClick={startGame}>Начать</button>
      ) : (
        <div>
          <div className="score-time">
            <p>Время: {time} сек</p>
            <p>Очки: {score}</p>
            <p>Промахи: {misses} / 3</p>
          </div>
          <div className="game-field" onClick={handleMiss}>
            <div
              className="target"
              style={{ top: targetPosition.top, left: targetPosition.left }}
              onClick={(e) => {
                e.stopPropagation();
                handleTargetClick();
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AimTest;