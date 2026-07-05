# Firebase Cloud Functions (Gemini proxy) - README

This folder contains the Firebase Cloud Functions scaffold used by SonaAI for server-side tasks such as proxying requests to Google Gemini.

How to deploy
1. Install dependencies:
   cd functions && npm install

2. Build the TypeScript:
   npm run build

3. Deploy to Firebase (requires firebase-tools and your project configured):
   firebase deploy --only functions:geminiProxy

Environment variables
- Set the following environment variables in your Cloud Functions environment (do NOT commit these to the repo):
  - FIREBASE_SERVER_SERVICE_ACCOUNT: stringified JSON for the service account (or use Application Default Credentials in GCP)
  - FIREBASE_PROJECT_ID
  - GEMINI_API_KEY (server-side only)
  - SENTRY_DSN (optional)

Notes
- The geminiProxy function is a stub in Phase 1 and returns HTTP 501. Real Gemini streaming will be implemented in Phase 4.
