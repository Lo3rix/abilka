import React, { useState } from 'react';
import axios from 'axios';
import AuthService from '../auth/authService';
import './ReactionTest.css';

const ReactionTest = ({ title, description, onResultSave, attemptCount, setAttemptCount }) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [penalties, setPenalties] = useState([]); // Хранит информацию о штрафах
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [message, setMessage] = useState('Нажмите старт, чтобы начать тест на реакцию');
  const [buttonState, setButtonState] = useState('start'); // start, wait, go
  const [penaltyApplied, setPenaltyApplied] = useState(false);

  const PENALTY_TIME = 500; // Штраф за фальстарт в мс

  const handleStart = () => {
    resetButtonAndTimer();
    setIsBeginning(false);
    setIsStarted(true);
    setIsTestCompleted(false);
    setButtonState('wait');
    setMessage('Ожидайте зеленого сигнала...');

    const delay = Math.floor(Math.random() * 5000) + 1000;

    setTimeout(() => {
      setStartTime(new Date().getTime());
      setButtonState('go');
      setMessage('');
    }, delay);
  };

  const resetButtonAndTimer = () => {
    setStartTime(null);
    setButtonState('start');
    setPenaltyApplied(false);
  };

  const handleStop = () => {
    if (isStarted) {
      if (buttonState === 'wait') {
        handleFalseStart();
      } else if (buttonState === 'go' && startTime) {
        const endTime = new Date().getTime();
        const timeTaken = endTime - startTime;

        const updatedAttempts = [...attempts, timeTaken];
        const updatedPenalties = [...penalties, false]; // Без штрафа
        setReactionTime(timeTaken);
        setAttempts(updatedAttempts);
        setPenalties(updatedPenalties);
        proceedToNextAttempt(updatedAttempts, updatedPenalties);
      }
    }
  };

  const handleFalseStart = () => {
    if (penaltyApplied) return; // Чтобы штраф применялся только 1 раз за попытку

    if (attemptCount === 1) {
      setMessage(`Фальстарт! Тест завершен.`);
      setIsStarted(false);
      setIsTestCompleted(true);
    } else {
      const penalizedTime = PENALTY_TIME;
      const updatedAttempts = [...attempts, penalizedTime];
      const updatedPenalties = [...penalties, true];

      setReactionTime(penalizedTime);
      setMessage(`Фальстарт! +${PENALTY_TIME} мс штраф.`);
      setAttempts(updatedAttempts);
      setPenalties(updatedPenalties);
      setPenaltyApplied(true);

      setTimeout(() => {
        proceedToNextAttempt(updatedAttempts, updatedPenalties);
      }, 1000);
    }
  };

  const proceedToNextAttempt = (updatedAttempts, updatedPenalties) => {
    if (currentAttempt + 1 >= attemptCount) {
      finalizeTest(updatedAttempts);
    } else {
      setCurrentAttempt(currentAttempt + 1);
      resetButtonAndTimer();

      setTimeout(() => {
        setMessage('Ожидайте зеленого сигнала...');
        setButtonState('wait');
        const delay = Math.floor(Math.random() * 5000) + 1000;

        setTimeout(() => {
          setStartTime(new Date().getTime());
          setButtonState('go');
          setMessage('');
        }, delay);
      }, 2000);
    }
  };

  const finalizeTest = (updatedAttempts) => {
    const averageTime = (updatedAttempts.reduce((a, b) => a + b, 0) / updatedAttempts.length).toFixed(2);

    saveResult(averageTime, attemptCount);

    setIsStarted(false);
    setIsTestCompleted(true);
    setMessage('Тест завершен. Нажмите "Начать заново".');
  };

  const saveResult = (averageTime, score) => {
    const user = AuthService.getCurrentUser();
    if (user && user.access) {
      axios.post('http://localhost:8000/api/results/', {
        test: 1,
        average_time: parseFloat(averageTime),
        score: score
      }, {
        headers: {
          'Authorization': `Bearer ${user.access}`
        }
      }).then(() => {
        onResultSave();
      }).catch(error => {
        console.error('Ошибка при сохранении результата:', error.response ? error.response.data : error.message);
      });
    } else {
      alert("Вы не авторизованы, результаты не будут сохранены.");
    }
  };

  const handleRetry = () => {
    setIsBeginning(true);
    setIsStarted(false);
    setIsTestCompleted(false);
    setStartTime(null);
    setReactionTime(null);
    setAttempts([]);
    setPenalties([]);
    setCurrentAttempt(0);
    setMessage('Нажмите старт, чтобы начать тест на реакцию');
    setButtonState('start');
  };

  const averageTime = attempts.length > 0
    ? (attempts.reduce((a, b) => a + b, 0) / attempts.length).toFixed(2)
    : 0;

  return (
    <div className="reaction-test">
      <h2>{title}</h2>
      <p className="test-description">{description}</p>
      <p>{message}</p>

    {isBeginning && (
      <div>
        <label>
          Количество попыток:
          <select value={attemptCount} onChange={(e) => setAttemptCount(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </label>
        <div className="reaction-btn-container">
          <button className="reaction-btn btn-start" onClick={handleStart}>Начать</button>
        </div>
      </div>
    )}

    {isStarted && (
      <div className="reaction-btn-container">
        {buttonState === 'wait' ? (
          <button className="reaction-btn btn-wait" onClick={handleStop}>НЕ ЖМИТЕ!</button>
        ) : buttonState === 'go' ? (
          <button className="reaction-btn btn-go" onClick={handleStop}></button>
        ) : null}
      </div>
    )}

    {isTestCompleted && (
      <div>
        <h3>Попытки:</h3>
        {attempts.map((attempt, index) => (
          <p key={index}>
            Попытка {index + 1}: {attempt} мс {penalties[index] && '(штраф)'}
          </p>
        ))}
        <p>Среднее время: {averageTime} мс</p>
        <button onClick={handleRetry}>Начать заново</button>
      </div>
    )}
    </div>
  );
};

export default ReactionTest;
