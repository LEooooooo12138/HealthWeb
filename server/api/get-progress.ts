import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as quizService from '../services/quiz-service';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: true, message: 'userId is required' });
  const progress = await quizService.getProgress(userId);
  res.status(200).json(progress);
};

export default withErrorHandler(handler);
