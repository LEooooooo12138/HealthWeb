export type Gender = 'male' | 'female';
export type Goal = 'lose_weight' | 'gain_weight' | 'maintain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type StepName = 'gender' | 'goal' | 'body' | 'activity';
export type SubscriptionStatus = 'free' | 'paid';

export interface GenderStep { gender: Gender; }
export interface GoalStep { goal: Goal; }
export interface BodyStep { age: number; heightCm: number; weightKg: number; targetWeightKg: number; }
export interface ActivityStep { activityLevel: ActivityLevel; }

export type StepData = GenderStep | GoalStep | BodyStep | ActivityStep;

export interface SaveStepBody { userId: string; step: StepName; data: StepData; }
export interface SaveStepResponse { ok: true; }

export interface QuizProgress {
  progress: Array<{ step: StepName; data: StepData }>;
  completedSteps: StepName[];
  currentStep: StepName | null;
}

export interface SubmitBody { userId: string; }
export interface SubmitResponse { ok: true; assessmentId: number; }

export interface AssessmentResult {
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  targetDate: string;
  weeklyPrediction: Array<{ week: number; weight: number; date: string }>;
}

export interface ResultResponseFree {
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  isPaid: false;
  lockedMessage: string;
}

export interface ResultResponsePaid {
  bmi: number;
  bmiCategory: string;
  dailyCalories: number;
  isPaid: true;
  targetDate: string;
  resultJson: AssessmentResult;
}

export type ResultResponse = ResultResponseFree | ResultResponsePaid;

export interface PayBody { userId: string; }
export interface PayResponse { ok: true; subscription: SubscriptionStatus; }
