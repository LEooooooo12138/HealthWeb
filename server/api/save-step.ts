import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as quizService from '../services/quiz-service';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method not allowed' });
  const { userId, step, data } = req.body;
  if (!userId || !step || !data) {
    return res.status(400).json({ error: true, message: 'userId, step, data are required', code: 'VALIDATION_ERROR' });
  }
  await quizService.saveStep(userId, step, data);
  res.status(200).json({ ok: true });
};

export default withErrorHandler(handler);
