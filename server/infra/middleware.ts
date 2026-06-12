import type { VercelRequest, VercelResponse } from '@vercel/node';

export type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

export function withErrorHandler(handler: Handler): Handler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err: any) {
      console.error('API error:', err);
      const status = err.name === 'ValidationError' ? 400 : 500;
      res.status(status).json({
        error: true,
        message: err.message || 'Internal server error',
        code: err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
      });
    }
  };
}
