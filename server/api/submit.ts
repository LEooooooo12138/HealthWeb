import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as quizService from '../services/quiz-service';
import * as subRepo from '../infra/db/subscription-repo';
import { calculateAssessment } from '../services/algorithm';
import type { ActivityLevel, BodyStep, Gender, Goal } from 'shared/types';
import * as quizRepo from '../infra/db/quiz-repo';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method not allowed' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: true, message: 'userId is required' });

  await quizService.submitQuiz(userId);

  const responses = await quizRepo.getResponses(userId);
  const genderResp = responses.find(r => r.step === 'gender')!.data as { gender: Gender };
  const goalResp = responses.find(r => r.step === 'goal')!.data as { goal: Goal };
  const bodyResp = responses.find(r => r.step === 'body')!.data as BodyStep;
  const activityResp = responses.find(r => r.step === 'activity')!.data as { activityLevel: ActivityLevel };

  const result = calculateAssessment({
    gender: genderResp.gender,
    goal: goalResp.goal,
    ...bodyResp,
    activityLevel: activityResp.activityLevel,
  });

  const assessmentId = await subRepo.saveAssessment(userId, {
    bmi: result.bmi,
    bmiCategory: result.bmiCategory,
    dailyCalories: result.dailyCalories,
    targetDate: result.targetDate,
    resultJson: result,
  });

  res.status(200).json({ ok: true, assessmentId });
};

export default withErrorHandler(handler);
