import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { QuizFlow } from './pages/QuizFlow';
import { ResultPage } from './pages/ResultPage';
function generateUserId() {
    return `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
export default function App() {
    const [userId] = useState(() => generateUserId());
    const [showResult, setShowResult] = useState(false);
    return (_jsxs("div", { className: "app", children: [_jsx("h1", { children: "Health Assessment" }), !showResult ? (_jsx(QuizFlow, { userId: userId, onComplete: () => setShowResult(true) })) : (_jsx(ResultPage, { userId: userId }))] }));
}
