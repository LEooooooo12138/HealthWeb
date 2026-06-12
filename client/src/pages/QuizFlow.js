import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
const STEPS = ['gender', 'goal', 'body', 'activity'];
export function QuizFlow({ userId, onComplete }) {
    const { progress, loading, submitted, save, submit } = useQuiz(userId);
    const [stepIndex, setStepIndex] = useState(0);
    const [formData, setFormData] = useState({});
    if (loading)
        return _jsx("div", { className: "quiz-loading", children: "\u52A0\u8F7D\u4E2D..." });
    if (submitted)
        return null;
    const currentStep = STEPS[stepIndex];
    const handleSaveStep = async () => {
        let data;
        if (currentStep === 'gender')
            data = { gender: formData.gender };
        else if (currentStep === 'goal')
            data = { goal: formData.goal };
        else if (currentStep === 'body')
            data = { age: +formData.age, heightCm: +formData.heightCm, weightKg: +formData.weightKg, targetWeightKg: +formData.targetWeightKg };
        else
            data = { activityLevel: formData.activityLevel };
        await save(currentStep, data);
        if (stepIndex < 3)
            setStepIndex(stepIndex + 1);
        else
            await submit();
    };
    return (_jsxs("div", { className: "quiz-container", children: [_jsxs("div", { className: "quiz-progress", children: ["\u6B65\u9AA4 ", stepIndex + 1, " / 4"] }), currentStep === 'gender' && (_jsxs("div", { className: "quiz-step", children: [_jsx("h2", { children: "\u4F60\u7684\u6027\u522B\u662F\uFF1F" }), ['male', 'female'].map(g => (_jsx("button", { onClick: () => setFormData({ ...formData, gender: g }), className: formData.gender === g ? 'selected' : '', children: g === 'male' ? '男性' : '女性' }, g)))] })), currentStep === 'goal' && (_jsxs("div", { className: "quiz-step", children: [_jsx("h2", { children: "\u4F60\u7684\u76EE\u6807\u662F\u4EC0\u4E48\uFF1F" }), ['lose_weight', 'gain_weight', 'maintain'].map(g => (_jsx("button", { onClick: () => setFormData({ ...formData, goal: g }), className: formData.goal === g ? 'selected' : '', children: g === 'lose_weight' ? '减重' : g === 'gain_weight' ? '增重' : '维持' }, g)))] })), currentStep === 'body' && (_jsxs("div", { className: "quiz-step", children: [_jsx("h2", { children: "\u4F60\u7684\u8EAB\u4F53\u6570\u636E" }), _jsx("input", { type: "number", placeholder: "\u5E74\u9F84", onChange: e => setFormData({ ...formData, age: e.target.value }) }), _jsx("input", { type: "number", placeholder: "\u8EAB\u9AD8 (cm)", onChange: e => setFormData({ ...formData, heightCm: e.target.value }) }), _jsx("input", { type: "number", placeholder: "\u4F53\u91CD (kg)", onChange: e => setFormData({ ...formData, weightKg: e.target.value }) }), _jsx("input", { type: "number", placeholder: "\u76EE\u6807\u4F53\u91CD (kg)", onChange: e => setFormData({ ...formData, targetWeightKg: e.target.value }) })] })), currentStep === 'activity' && (_jsxs("div", { className: "quiz-step", children: [_jsx("h2", { children: "\u4F60\u7684\u8FD0\u52A8\u9891\u7387\uFF1F" }), ['sedentary', 'light', 'moderate', 'active', 'very_active'].map(a => (_jsx("button", { onClick: () => setFormData({ ...formData, activityLevel: a }), className: formData.activityLevel === a ? 'selected' : '', children: a === 'sedentary' ? '几乎不运动' : a === 'light' ? '轻度运动' : a === 'moderate' ? '中等运动' : a === 'active' ? '活跃' : '非常活跃' }, a)))] })), _jsx("button", { onClick: handleSaveStep, className: "quiz-next", children: stepIndex < 3 ? '下一步' : '查看结果' })] }));
}
