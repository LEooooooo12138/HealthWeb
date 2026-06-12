import { STEPS } from 'shared/constants';
import { ValidationError, validateBodyStep } from 'shared/validation';
import type { StepName, StepData, QuizProgress, BodyStep } from 'shared/types';
import * as userRepo from '../infra/db/user-repo';
import * as quizRepo from '../infra/db/quiz-repo';

export async function saveStep(userId: string, step: StepName, data: StepData): Promise<void> {
  await userRepo.ensureUser(userId);
  if (step === 'body') {
    validateBodyStep(data as BodyStep);
  }
  await quizRepo.saveResponse(userId, step, data);
}

export async function getProgress(userId: string): Promise<QuizProgress> {
  const responses = await quizRepo.getResponses(userId);
  const completedSteps = responses.map(r => r.step) as StepName[];
  const remaining = STEPS.filter(s => !completedSteps.includes(s));
  const currentStep = remaining.length > 0 ? remaining[0] : null;
  return { progress: responses, completedSteps, currentStep };
}

export async function submitQuiz(userId: string): Promise<void> {
  const allDone = await quizRepo.hasAllSteps(userId);
  if (!allDone) throw new ValidationError('All 4 steps must be completed before submitting');
}
