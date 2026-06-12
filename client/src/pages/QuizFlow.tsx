import { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import type { StepData, Gender, Goal, ActivityLevel } from 'shared/types';

interface Props { userId: string; onComplete: () => void; }

const STEPS = ['gender', 'goal', 'body', 'activity'] as const;

export function QuizFlow({ userId, onComplete }: Props) {
  const { progress, loading, submitted, save, submit } = useQuiz(userId);
  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  if (loading) return <div className="quiz-loading">加载中...</div>;
  if (submitted) return null;

  const currentStep = STEPS[stepIndex];

  const handleSaveStep = async () => {
    let data: StepData;
    if (currentStep === 'gender') data = { gender: formData.gender as Gender };
    else if (currentStep === 'goal') data = { goal: formData.goal as Goal };
    else if (currentStep === 'body') data = { age: +formData.age, heightCm: +formData.heightCm, weightKg: +formData.weightKg, targetWeightKg: +formData.targetWeightKg };
    else data = { activityLevel: formData.activityLevel as ActivityLevel };

    await save(currentStep, data);
    if (stepIndex < 3) setStepIndex(stepIndex + 1);
    else await submit();
  };

  return (
    <div className="quiz-container">
      <div className="quiz-progress">步骤 {stepIndex + 1} / 4</div>

      {currentStep === 'gender' && (
        <div className="quiz-step">
          <h2>你的性别是？</h2>
          {(['male', 'female'] as const).map(g => (
            <button key={g} onClick={() => setFormData({ ...formData, gender: g })} className={formData.gender === g ? 'selected' : ''}>
              {g === 'male' ? '男性' : '女性'}
            </button>
          ))}
        </div>
      )}

      {currentStep === 'goal' && (
        <div className="quiz-step">
          <h2>你的目标是什么？</h2>
          {(['lose_weight', 'gain_weight', 'maintain'] as const).map(g => (
            <button key={g} onClick={() => setFormData({ ...formData, goal: g })} className={formData.goal === g ? 'selected' : ''}>
              {g === 'lose_weight' ? '减重' : g === 'gain_weight' ? '增重' : '维持'}
            </button>
          ))}
        </div>
      )}

      {currentStep === 'body' && (
        <div className="quiz-step">
          <h2>你的身体数据</h2>
          <input type="number" placeholder="年龄" onChange={e => setFormData({ ...formData, age: e.target.value })} />
          <input type="number" placeholder="身高 (cm)" onChange={e => setFormData({ ...formData, heightCm: e.target.value })} />
          <input type="number" placeholder="体重 (kg)" onChange={e => setFormData({ ...formData, weightKg: e.target.value })} />
          <input type="number" placeholder="目标体重 (kg)" onChange={e => setFormData({ ...formData, targetWeightKg: e.target.value })} />
        </div>
      )}

      {currentStep === 'activity' && (
        <div className="quiz-step">
          <h2>你的运动频率？</h2>
          {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as const).map(a => (
            <button key={a} onClick={() => setFormData({ ...formData, activityLevel: a })} className={formData.activityLevel === a ? 'selected' : ''}>
              {a === 'sedentary' ? '几乎不运动' : a === 'light' ? '轻度运动' : a === 'moderate' ? '中等运动' : a === 'active' ? '活跃' : '非常活跃'}
            </button>
          ))}
        </div>
      )}

      <button onClick={handleSaveStep} className="quiz-next">
        {stepIndex < 3 ? '下一步' : '查看结果'}
      </button>
    </div>
  );
}
