import React, { useState, useEffect } from 'react';
import TestSelection from './TestSelection';
import ReactionTest from '../tests/ReactionTest';
import AimTest from '../tests/AimTest';
import TypingTest from '../tests/TypingTest';
import ResultsReac from '../tests/ResultsReac';
import ResultsAim from '../tests/ResultsAim';
import ResultsTyping from '../tests/ResultsTypingTest';
import AuthService from '../auth/authService';
import axios from 'axios';
import './layout.css';

const TestContent = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(1);

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    fetchResults(test.id, score);
  };

  const fetchResults = (testId, score) => {
    const user = AuthService.getCurrentUser();
    if (user && user.access) {
      axios.get('http://localhost:8000/api/results/', {
        headers: {
          'Authorization': `Bearer ${user.access}`
        },
        params: {
          test: testId,
          score: score
        }
      })
      .then(response => {
        setResults(response.data);
      })
      .catch(error => {
        console.error('Error fetching results:', error.response ? error.response.data : error.message);
      });
    } else {
      console.error('No user token found');
    }
  };

  const handleScoreChange = (score) => {
    setScore(score);
    if (selectedTest) {
      fetchResults(selectedTest.id, score);
    }
  };

  return (
    <div className="test-content">
      <TestSelection onSelectTest={handleSelectTest} />
      {selectedTest && (
        <div>
          {selectedTest.id === 1 && (
            <>
              <ReactionTest
                title={selectedTest.title}
                description={selectedTest.description}
                onResultSave={() => fetchResults(selectedTest.id, score)}
                attemptCount={score}
                setAttemptCount={handleScoreChange}
              />
              <ResultsReac
                selectedTest={selectedTest}
                results={results}
                setResults={setResults}
                score={score}
                setScore={handleScoreChange}
              />
            </>
          )}
          {selectedTest.id === 2 && (
            <>
              <AimTest
                title={selectedTest.title}
                description={selectedTest.description}
                onResultSave={() => fetchResults(selectedTest.id, score)}
              />
              <ResultsAim
                selectedTest={selectedTest}
                results={results}
                setResults={setResults}
              />
            </>
          )}
          {selectedTest.id === 3 && (
            <>
              <TypingTest
                title={selectedTest.title}
                description={selectedTest.description}
                onResultSave={() => fetchResults(selectedTest.id, score)}
              />
              <ResultsTyping
                selectedTest={selectedTest}
                results={results}
                setResults={setResults}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TestContent;
