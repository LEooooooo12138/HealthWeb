export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_CALORIE_ADJUSTMENT: Record<string, number> = {
  lose_weight: -500,
  gain_weight: 500,
  maintain: 0,
};

export const BMI_CATEGORIES = [
  { max: 18.5, label: 'underweight' },
  { max: 25, label: 'normal' },
  { max: 30, label: 'overweight' },
  { max: Infinity, label: 'obese' },
] as const;

export const KCAL_PER_KG = 7700;

export const STEPS: Array<'gender' | 'goal' | 'body' | 'activity'> = ['gender', 'goal', 'body', 'activity'];

export const VALIDATION_RULES = {
  heightCm: { min: 50, max: 240 },
  weightKg: { min: 30, max: 300 },
  targetWeightKg: { min: 30, max: 200 },
  age: { min: 10, max: 120 },
};
