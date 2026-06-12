import * as userRepo from '../infra/db/user-repo';
import * as subRepo from '../infra/db/subscription-repo';
import type { ResultResponse, AssessmentResult } from 'shared/types';

export async function processPayment(userId: string): Promise<void> {
  await userRepo.setUserPaid(userId);
  await subRepo.recordPayment(userId);
}

export async function getResult(userId: string): Promise<ResultResponse> {
  const isPaid = (await userRepo.getUserSubscription(userId)) === 'paid';
  const assessment = await subRepo.getAssessment(userId);
  if (!assessment) throw new Error('Assessment not found');

  if (!isPaid) {
    return {
      bmi: assessment.bmi,
      bmiCategory: assessment.bmi_category,
      dailyCalories: assessment.daily_calories,
      isPaid: false,
      lockedMessage: '订阅后解锁完整报告',
    };
  }

  return {
    bmi: assessment.bmi,
    bmiCategory: assessment.bmi_category,
    dailyCalories: assessment.daily_calories,
    isPaid: true,
    targetDate: assessment.target_date,
    resultJson: assessment.result_json as AssessmentResult,
  };
}
