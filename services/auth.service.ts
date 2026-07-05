// Authentication Service - Placeholder for future Firebase/Supabase integration
// TODO: Implement real authentication

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

// TODO: Replace with Firebase Auth or Supabase Auth
export const signIn = async (credentials: AuthCredentials): Promise<AuthUser> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // TODO: Implement real sign in
  // return await supabase.auth.signInWithPassword(credentials);
  return {
    id: 'mock_user_001',
    email: credentials.email,
    displayName: 'SONA User',
    createdAt: new Date().toISOString(),
  };
};

export const signUp = async (credentials: AuthCredentials & { displayName: string }): Promise<AuthUser> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // TODO: Implement real sign up
  return {
    id: `user_${Date.now()}`,
    email: credentials.email,
    displayName: credentials.displayName,
    createdAt: new Date().toISOString(),
  };
};

export const signOut = async (): Promise<void> => {
  // TODO: Implement real sign out
  await new Promise(resolve => setTimeout(resolve, 300));
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  // TODO: Check Firebase/Supabase session
  return null;
};

// TODO: Google OAuth
export const signInWithGoogle = async (): Promise<AuthUser> => {
  throw new Error('Google OAuth not yet implemented - TODO: Add Firebase Google Auth');
};
