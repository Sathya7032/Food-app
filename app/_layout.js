// app/_layout.tsx
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from 'react';
import { useAuthStore } from './auth/useAuthStore';

export default function RootLayout() {
  const { verifyToken } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await verifyToken();
        router.replace(isAuthenticated ? '/(tabs)/home' : '/(login)');
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/(login)');
      }
    };

    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" />
      </Stack>
    </SafeAreaProvider>
  );
}