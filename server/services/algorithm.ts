import { ACTIVITY_MULTIPLIERS, GOAL_CALORIE_ADJUSTMENT, BMI_CATEGORIES, KCAL_PER_KG, VALIDATION_RULES } from 'shared/constants';
import { ValidationError, validateBodyStep } from 'shared/validation';
import type { AssessmentResult, BodyStep, Gender, Goal, ActivityLevel } from 'shared/types';

export interface UserProfile extends BodyStep {
  gender: Gender;
  goal: Goal;
  activityLevel: ActivityLevel;
}

export function calculateAssessment(profile: UserProfile): AssessmentResult {
  validateBodyStep({ age: profile.age, heightCm: profile.heightCm, weightKg: profile.weightKg, targetWeightKg: profile.targetWeightKg });

  const heightM = profile.heightCm / 100;
  const bmi = Math.round((profile.weightKg / (heightM * heightM)) * 10) / 10;

  let bmiCategory = 'obese';
  for (const cat of BMI_CATEGORIES) {
    if (bmi < cat.max) { bmiCategory = cat.label; break; }
  }

  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
  }

  const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.2;
  const goalAdjustment = GOAL_CALORIE_ADJUSTMENT[profile.goal] ?? 0;
  const dailyCalories = Math.round(bmr * activityMultiplier + goalAdjustment);

  const weightDiff = Math.abs(profile.targetWeightKg - profile.weightKg);
  const daysNeeded = Math.round((weightDiff * KCAL_PER_KG) / 500);
  const today = new Date();
  const targetDate = new Date(today.getTime() + daysNeeded * 86400000);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  const weeklyPrediction: Array<{ week: number; weight: number; date: string }> = [];
  const direction = profile.targetWeightKg > profile.weightKg ? 1 : -1;
  let currentWeight = profile.weightKg;
  for (let week = 1; week <= Math.ceil(daysNeeded / 7); week++) {
    currentWeight += direction * (500 * 7) / KCAL_PER_KG;
    if (direction > 0 && currentWeight > profile.targetWeightKg) currentWeight = profile.targetWeightKg;
    if (direction < 0 && currentWeight < profile.targetWeightKg) currentWeight = profile.targetWeightKg;
    const d = new Date(today.getTime() + week * 7 * 86400000);
    weeklyPrediction.push({ week, weight: Math.round(currentWeight * 10) / 10, date: d.toISOString().split('T')[0] });
  }

  return { bmi, bmiCategory, dailyCalories, targetDate: targetDateStr, weeklyPrediction };
}
