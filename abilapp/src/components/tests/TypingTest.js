import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthService from '../auth/authService';
import './TypingTest.css';

const TypingTest = ({ title, description, onResultSave }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [text, setText] = useState('');
  const [inputText, setInputText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const timerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const fetchRandomText = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/texts/');
        const texts = response.data;
        const randomText = texts[Math.floor(Math.random() * texts.length)].text;
        setText(randomText);
      } catch (error) {
        console.error('Ошибка при загрузке текста:', error.response ? error.response.data : error.message);
      }
    };

    fetchRandomText();
  }, []);

  useEffect(() => {
    if (isStarted) {
      timerRef.current = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        setCurrentTime(elapsedTime);
        const correctChars = inputText.split('').filter((char, i) => char === text[i]).length;
        setCpm(Math.floor((correctChars / elapsedTime) * 60));
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, inputText.length, startTime]);

  const handleKeyDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isStarted || e.key.length > 1) {
      return;
    }

    setInputText((prev) => prev + e.key);

    const value = inputText + e.key;
    const correctChars = value.split('').filter((char, i) => char === text[i]).length;
    const accuracy = (correctChars / value.length) * 100;
    setAccuracy(accuracy);

    if (value.length >= text.length) {
      setIsStarted(false);
      clearInterval(timerRef.current);
      const timeTaken = (Date.now() - startTime) / 1000;
      alert(`Тест завершен! Скорость: ${cpm} CPM, Точность: ${accuracy.toFixed(2)}%, Время: ${timeTaken.toFixed(2)} сек`);

      saveResult(timeTaken, cpm);
    }
  };

  const saveResult = (averageTime, score) => {
    const user = AuthService.getCurrentUser();
    if (user && user.access) {
      axios.post('http://localhost:8000/api/results/', {
        test: 3, // ID теста на печать
        average_time: averageTime,
        score: score,
      }, {
        headers: {
          'Authorization': `Bearer ${user.access}`,
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

  const startTest = () => {
    setIsStarted(true);
    setInputText('');
    setStartTime(Date.now());
    setCurrentTime(0);
    setCpm(0);
    setAccuracy(100);

    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
      }
    }, 0);
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = '';
      if (index < inputText.length) {
        className = char === inputText[index] ? 'correct' : 'incorrect';
      } else if (index === inputText.length) {
        className = 'current';
      }
      return (
        <span key={index} className={className}>{char}</span>
      );
    });
  };

  return (
    <div className="typing-test">
      <h2>{title}</h2>
      <p className="test-description">{description}</p>
      {!isStarted ? (
        <button onClick={startTest}>Начать</button>
      ) : (
        <div>
          <div className="score-time">
            <p>Время: {currentTime.toFixed(2)} сек</p>
            <p>Скорость: {cpm} CPM</p>
            <p>Точность: {accuracy.toFixed(2)}%</p>
          </div>
          <div className="text-display" tabIndex="0" ref={textRef} onKeyDown={handleKeyDown}>
            {renderText()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingTest;