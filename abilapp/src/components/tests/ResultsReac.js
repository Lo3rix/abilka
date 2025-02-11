import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../auth/authService';
import './Tests.css';

const ResultsReac = ({ selectedTest, results, setResults, score, setScore }) => {
  const [globalResults, setGlobalResults] = useState([]);
  const [displayType, setDisplayType] = useState('my');
  const [message, setMessage] = useState('');
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0
  });

  const fetchResults = async (url = `http://localhost:8000/api/results/`) => {
    const user = AuthService.getCurrentUser();
    if (!user || !user.access || !selectedTest?.id) return;

    try {
      console.log(`Fetching results from: ${url}`);
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${user.access}` },
        params: { test: selectedTest.id, score: score }
      });

      console.log("Results fetched:", response.data);
      setResults(response.data.results || []);
      setPagination({
        next: response.data.next,
        previous: response.data.previous,
        count: response.data.count || 0
      });

    } catch (error) {
      console.error('Error fetching results:', error.response?.data || error.message);
      setResults([]);
    }
  };

  const fetchGlobalResults = async (url = `http://localhost:8000/api/results/global/`) => {
    const user = AuthService.getCurrentUser();
    if (displayType !== 'global' || !selectedTest?.id || !user?.access) return;

    try {
      console.log(`Fetching global results from: ${url}`);
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${user.access}` },
        params: { test: selectedTest.id, score: score }
      });

      console.log("Global results fetched:", response.data);
      setGlobalResults(response.data.results || []);
      setPagination({
        next: response.data.next,
        previous: response.data.previous,
        count: response.data.count || 0
      });

    } catch (error) {
      console.error('Error fetching global results:', error.response?.data || error.message);
      setGlobalResults([]);
    }
  };

  useEffect(() => {
    if (displayType === 'my') {
      fetchResults();
    } else {
      fetchGlobalResults();
    }
  }, [selectedTest, displayType, score]);

  const handlePageChange = (url) => {
    if (!url) return;
    if (displayType === 'global') {
      fetchGlobalResults(url);
    } else {
      fetchResults(url);
    }
  };

  const handleClearResults = async () => {
    const user = AuthService.getCurrentUser();
    if (!user || !user.access || !selectedTest?.id) return;

    try {
      await axios.delete('http://localhost:8000/api/results/', {
        headers: { 'Authorization': `Bearer ${user.access}` },
        params: { test: selectedTest.id, score: score }
      });
      setResults([]);
      setMessage('Результаты успешно очищены.');
    } catch (error) {
      console.error('Error clearing results:', error.response?.data || error.message);
      setMessage('Ошибка при очистке результатов.');
    }
  };

  const displayedResults = displayType === 'global' ? globalResults : results;

  return (
    <div className="results">
      <h2>Результаты</h2>
      <div>
        <label>
          Количество попыток:
          <select value={score} onChange={(e) => setScore(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
          </select>
        </label>
      </div>
      <select onChange={(e) => setDisplayType(e.target.value)} value={displayType}>
        <option value="my">Мои результаты</option>
        <option value="global">Глобальный топ</option>
      </select>

      {Array.isArray(displayedResults) && displayedResults.length > 0 ? (
        <ul>
          {displayedResults.map(result => (
            <li key={result.id}>
              {displayType === 'global' && <strong>{result.user?.username} - </strong>}
              Время: {result.average_time} мс, Дата: {new Date(result.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>Нет результатов</p>
      )}

      <div className="pagination">
        {pagination.previous && (
          <button onClick={() => handlePageChange(pagination.previous)}>
            Назад
          </button>
        )}
        {pagination.next && (
          <button onClick={() => handlePageChange(pagination.next)}>
            Далее
          </button>
        )}
      </div>

      {displayType === 'my' && <button onClick={handleClearResults}>Очистить результаты</button>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResultsReac;