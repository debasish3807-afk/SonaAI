// @ts-nocheck
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useFirebaseAuth } from './hook';

const DefaultLoadingScreen = () => (
  <View style={styles.defaultContainer}>
    <ActivityIndicator size="large" color="#7C6FFF" />
    <Text style={styles.defaultText}>Loading...</Text>
  </View>
);

interface FirebaseAuthRouterProps {
  children: React.ReactNode;
  loginRoute?: string;
  loadingComponent?: React.ComponentType;
  excludeRoutes?: string[];
}

export function FirebaseAuthRouter({
  children,
  loginRoute = '/login',
  loadingComponent: LoadingComponent = DefaultLoadingScreen,
  excludeRoutes = [],
}: FirebaseAuthRouterProps) {
  const { user, loading, initialized } = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    const isLoginRoute = pathname === loginRoute;
    const isExcludedRoute = excludeRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (!user && !isLoginRoute && !isExcludedRoute) {
      router.push(loginRoute);
    } else if (user && isLoginRoute) {
      router.replace('/');
    }
  }, [user?.id, loading, initialized, pathname, loginRoute, excludeRoutes, router]);

  if (loading || !initialized) {
    return <LoadingComponent />;
  }

  const isLoginRoute = pathname === loginRoute;
  const isExcludedRoute = excludeRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isLoginRoute || isExcludedRoute || user) {
    return <>{children}</>;
  }

  return <LoadingComponent />;
}

const styles = StyleSheet.create({
  defaultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D20',
    gap: 12,
  },
  defaultText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
