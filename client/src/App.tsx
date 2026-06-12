import { useState } from 'react';
import { QuizFlow } from './pages/QuizFlow';
import { ResultPage } from './pages/ResultPage';

function generateUserId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function App() {
  const [userId] = useState(() => generateUserId());
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="app">
      <h1>Health Assessment</h1>
      {!showResult ? (
        <QuizFlow userId={userId} onComplete={() => setShowResult(true)} />
      ) : (
        <ResultPage userId={userId} />
      )}
    </div>
  );
}
