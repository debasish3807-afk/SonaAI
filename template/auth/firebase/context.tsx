// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { firebaseAuthService } from './service';

interface FirebaseAuthContextState {
  user: AuthUser | null;
  loading: boolean;
  operationLoading: boolean;
  initialized: boolean;
}

interface FirebaseAuthContextActions {
  setOperationLoading: (loading: boolean) => void;
}

type FirebaseAuthContextType = FirebaseAuthContextState & FirebaseAuthContextActions;

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [state, setState] = useState<FirebaseAuthContextState>({
    user: null,
    loading: true,
    operationLoading: false,
    initialized: false,
  });

  const updateState = (updates: Partial<FirebaseAuthContextState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  };

  const setOperationLoading = (loading: boolean) => {
    updateState({ operationLoading: loading });
  };

  useEffect(() => {
    let isMounted = true;

    const subscription = firebaseAuthService.onAuthStateChange((authUser) => {
      if (isMounted) {
        updateState({
          user: authUser,
          loading: false,
          initialized: true,
        });
      }
    });

    return () => {
      isMounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const contextValue: FirebaseAuthContextType = {
    ...state,
    setOperationLoading,
  };

  return (
    <FirebaseAuthContext.Provider value={contextValue}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuthContext(): FirebaseAuthContextType {
  const context = useContext(FirebaseAuthContext);

  if (context === undefined) {
    throw new Error('useFirebaseAuthContext must be used within a FirebaseAuthProvider');
  }

  return context;
}
