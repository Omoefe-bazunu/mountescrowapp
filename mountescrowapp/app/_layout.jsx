// import { Stack, SplashScreen, useRouter, useSegments } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { ThemeProvider } from "../contexts/ThemeContext";
// import { AuthProvider, useAuth } from "../contexts/AuthContexts";
// import { SafeAreaWrapper } from "../components/ui/SafeAreaWrapper";
// import ErrorBoundary from "../components/ErrorBoundary";
// import { useFonts, Montaga_400Regular } from "@expo-google-fonts/montaga";
// import { useEffect } from "react";

// function NavigationGuard() {
//   const { user, loading } = useAuth();
//   const segments = useSegments();
//   const router = useRouter();

//   useEffect(() => {
//     if (loading) return;

//     const inAuthGroup = segments[0] === "(auth)";
//     const inTabsGroup = segments[0] === "(tabs)";
//     const currentTab = segments[1];

//     // Use a single "nextPath" variable to avoid multiple replace calls
//     let nextPath = null;

//     if (
//       !user &&
//       inTabsGroup &&
//       (currentTab === "dashboard" || currentTab === "profile")
//     ) {
//       nextPath = "/login";
//     } else if (user && inAuthGroup) {
//       nextPath = "/(tabs)/dashboard";
//     }

//     if (nextPath) {
//       // Small timeout prevents navigation collisions during screen transitions
//       const timer = setTimeout(() => {
//         router.replace(nextPath);
//       }, 1);
//       return () => clearTimeout(timer);
//     }
//   }, [user, loading, segments]);

//   return <Stack screenOptions={{ headerShown: false }} />;
// }

// export default function RootLayout() {
//   const [fontsLoaded] = useFonts({
//     Montaga: Montaga_400Regular,
//   });

//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded]);

//   if (!fontsLoaded) return null;

//   return (
//     <ErrorBoundary>
//       <ThemeProvider>
//         <AuthProvider>
//           <SafeAreaWrapper>
//             <NavigationGuard />
//             <StatusBar style="auto" />
//           </SafeAreaWrapper>
//         </AuthProvider>
//       </ThemeProvider>
//     </ErrorBoundary>
//   );
// }

import { Stack, SplashScreen, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider, useAuth } from "../contexts/AuthContexts";
import { SafeAreaWrapper } from "../components/ui/SafeAreaWrapper";
import ErrorBoundary from "../components/ErrorBoundary";
import { useFonts, Montaga_400Regular } from "@expo-google-fonts/montaga";
import { useEffect, useRef } from "react";
import { View, PanResponder } from "react-native";

function NavigationGuard() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    let nextPath = null;

    // 1. GLOBAL PROTECTION: If user is NOT logged in and tries to access ANY tab
    if (!user && inTabsGroup) {
      nextPath = "/login";
    }

    // 2. If user IS logged in but tries to access Login/Signup screens
    else if (user && inAuthGroup) {
      // Redirect to your main landing screen (Home or Dashboard)
      nextPath = "/(tabs)";
    }

    if (nextPath) {
      // Small timeout prevents navigation collisions
      const timer = setTimeout(() => {
        router.replace(nextPath);
      }, 1);
      return () => clearTimeout(timer);
    }
  }, [user, loading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

// Wrapper to handle global inactivity touches
const InactivityWrapper = ({ children }) => {
  const { notifyInteraction } = useAuth();

  // PanResponder to capture any touch on the screen to reset timer
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        notifyInteraction(); // Reset timer on any touch start
        return false; // Let the touch pass through to child components
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

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
          <InactivityWrapper>
            <SafeAreaWrapper>
              <NavigationGuard />
              <StatusBar style="auto" />
            </SafeAreaWrapper>
          </InactivityWrapper>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
