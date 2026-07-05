// @ts-nocheck
export * from './types';

// Firebase authentication system
export { useFirebaseAuth as useAuth, useFirebaseAuthDebug } from './firebase/hook';
export { firebaseAuthService as authService } from './firebase/service';
export { FirebaseAuthRouter as AuthRouter } from './firebase/router';
export { FirebaseAuthProvider as AuthProvider } from './firebase/context';
