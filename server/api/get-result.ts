import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as subService from '../services/subscription-service';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: true, message: 'userId is required' });
  const result = await subService.getResult(userId);
  res.status(200).json(result);
};

export default withErrorHandler(handler);
