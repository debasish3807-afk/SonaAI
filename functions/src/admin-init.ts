// functions/src/admin-init.ts
// Initializes the Firebase Admin SDK using a service account provided via environment variable.

import * as admin from 'firebase-admin';
import { logger } from '../../utils/logger';

let initialized = false;

export function initAdmin() {
  if (initialized) return admin;

  try {
    const serviceAccountRaw = process.env.FIREBASE_SERVER_SERVICE_ACCOUNT;
    if (serviceAccountRaw) {
      // service account should be a JSON string
      const serviceAccount = JSON.parse(serviceAccountRaw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      logger.info('firebase-admin initialized with service account');
    } else {
      // fallback to application default credentials (e.g., when running in GCP)
      admin.initializeApp();
      logger.info('firebase-admin initialized with application default credentials');
    }
    initialized = true;
    return admin;
  } catch (err: any) {
    logger.error('Failed to initialize firebase-admin', { error: err?.message ?? String(err) });
    throw err;
  }
}
