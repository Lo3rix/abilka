import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../auth/authService';
import './layout.css';

const TestSelection = ({ onSelectTest }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTests = async (page = 1) => {
    const user = AuthService.getCurrentUser();
    try {
      const response = await axios.get('http://localhost:8000/api/tests/', {
        headers: user && user.access ? { 'Authorization': `Bearer ${user.access}` } : {},
        params: { page }
      });

      setTests(response.data.results);
    } catch (error) {
      setError('Не удалось загрузить тесты. Попробуйте позже.');
      console.error('Error fetching tests:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <div className="test-selection">
      {loading && <p>Загрузка...</p>}
      {error && <p className="error-message">{error}</p>}

      {Array.isArray(tests) && tests.map(test => (
        <div key={test.id} className="test-button">
          <button onClick={() => onSelectTest(test)}>
            {test.title}
          </button>
        </div>
      ))}
    </div>
  );
};

export default TestSelection;