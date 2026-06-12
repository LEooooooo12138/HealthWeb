import { describe, it, expect } from 'vitest';

describe('calculateAssessment', () => {
  it('rejects height below minimum', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    expect(() =>
      calculateAssessment({ gender: 'male', age: 30, heightCm: 49, weightKg: 80, targetWeightKg: 70, goal: 'lose_weight', activityLevel: 'moderate' })
    ).toThrow('heightCm');
  });

  it('rejects weight below minimum', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    expect(() =>
      calculateAssessment({ gender: 'male', age: 30, heightCm: 175, weightKg: 29, targetWeightKg: 70, goal: 'lose_weight', activityLevel: 'moderate' })
    ).toThrow('weightKg');
  });

  it('rejects targetWeightKg above max', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    expect(() =>
      calculateAssessment({ gender: 'male', age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 201, goal: 'lose_weight', activityLevel: 'moderate' })
    ).toThrow('targetWeightKg');
  });

  it('rejects age below minimum', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    expect(() =>
      calculateAssessment({ gender: 'male', age: 9, heightCm: 175, weightKg: 80, targetWeightKg: 70, goal: 'lose_weight', activityLevel: 'moderate' })
    ).toThrow('age');
  });

  it('computes correct BMI for standard male input', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'male', age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 70,
      goal: 'lose_weight', activityLevel: 'moderate',
    });
    expect(result.bmi).toBeCloseTo(26.1, 1);
    expect(result.bmiCategory).toBe('overweight');
  });

  it('uses female formula for BMR', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'female', age: 25, heightCm: 165, weightKg: 55, targetWeightKg: 60,
      goal: 'gain_weight', activityLevel: 'light',
    });
    expect(result.dailyCalories).toBeCloseTo(2281, 0);
    expect(result.bmiCategory).toBe('normal');
  });

  it('maintain does not adjust calories', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'male', age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 80,
      goal: 'maintain', activityLevel: 'sedentary',
    });
    expect(result.dailyCalories).toBeCloseTo(2099, 0);
  });

  it('computes target date for weight loss', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'male', age: 30, heightCm: 175, weightKg: 80, targetWeightKg: 70,
      goal: 'lose_weight', activityLevel: 'moderate',
    });
    const days = Math.round((new Date(result.targetDate).getTime() - Date.now()) / 86400000);
    expect(days).toBeCloseTo(154, 0);
    expect(result.weeklyPrediction.length).toBeGreaterThan(0);
  });

  it('handles boundary low height and weight', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'female', age: 10, heightCm: 50, weightKg: 30, targetWeightKg: 30,
      goal: 'maintain', activityLevel: 'sedentary',
    });
    expect(result.bmi).toBeGreaterThan(0);
    expect(result.dailyCalories).toBeGreaterThan(0);
  });

  it('handles boundary high values', async () => {
    const { calculateAssessment } = await import('../../server/services/algorithm');
    const result = calculateAssessment({
      gender: 'male', age: 120, heightCm: 240, weightKg: 300, targetWeightKg: 200,
      goal: 'lose_weight', activityLevel: 'very_active',
    });
    expect(result.bmi).toBeGreaterThan(0);
    expect(result.dailyCalories).toBeGreaterThan(0);
  });
});
