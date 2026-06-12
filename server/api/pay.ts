import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withErrorHandler } from '../infra/middleware';
import * as subService from '../services/subscription-service';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).json({ error: true, message: 'Method not allowed' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: true, message: 'userId is required' });
  await subService.processPayment(userId);
  res.status(200).json({ ok: true, subscription: 'paid' });
};

export default withErrorHandler(handler);
