import { Stack, SplashScreen, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider, useAuth } from "../contexts/AuthContexts";
import { SafeAreaWrapper } from "../components/ui/SafeAreaWrapper";
import ErrorBoundary from "../components/ErrorBoundary";
import { useFonts, Montaga_400Regular } from "@expo-google-fonts/montaga";
import { useEffect } from "react";

function NavigationGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const currentTab = segments[1];

    // Use a single "nextPath" variable to avoid multiple replace calls
    let nextPath = null;

    if (
      !user &&
      inTabsGroup &&
      (currentTab === "dashboard" || currentTab === "profile")
    ) {
      nextPath = "/login";
    } else if (user && inAuthGroup) {
      nextPath = "/(tabs)/dashboard";
    }

    if (nextPath) {
      // Small timeout prevents navigation collisions during screen transitions
      const timer = setTimeout(() => {
        router.replace(nextPath);
      }, 1);
      return () => clearTimeout(timer);
    }
  }, [user, loading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montaga: Montaga_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SafeAreaWrapper>
            <NavigationGuard />
            <StatusBar style="auto" />
          </SafeAreaWrapper>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
