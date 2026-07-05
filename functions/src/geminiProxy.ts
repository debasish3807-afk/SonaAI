// functions/src/geminiProxy.ts
// Gemini proxy stub for Phase 1. Validates Firebase ID token and returns a 501 response.

import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { initAdmin } from './admin-init';
import { logger } from '../../utils/logger';

const admin = initAdmin();

export const geminiProxy = functions.region('us-central1').https.onRequest(async (req: Request, res: Response) => {
  try {
    const authHeader = req.get('Authorization') || req.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: missing Bearer token' });
      return;
    }

    const idToken = authHeader.split(' ')[1];
    let decoded: any = null;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      logger.warn('Invalid Firebase ID token', { error: (err as any)?.message ?? String(err) });
      res.status(401).json({ error: 'Unauthorized: invalid token' });
      return;
    }

    logger.info('geminiProxy request', { uid: decoded.uid, path: req.path });

    // For Phase 1 we return a stub response — real streaming to Gemini will be implemented in Phase 4
    const geminiKeyPresent = !!process.env.GEMINI_API_KEY;
    res.status(501).json({ message: 'Gemini proxy not implemented yet.', geminiKeyPresent });
  } catch (err: any) {
    logger.error('geminiProxy error', { error: err?.message ?? String(err) });
    res.status(500).json({ error: 'Internal server error' });
  }
});
