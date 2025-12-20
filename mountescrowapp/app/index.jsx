import React, { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContexts";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    checkFirstLaunch();
  }, [user, isLoading]);

  const checkFirstLaunch = async () => {
    if (isLoading) return;

    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");

      if (!hasSeenOnboarding) {
        router.replace("/(onboarding)");
      } else if (user) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    } catch (error) {
      console.error("Error checking first launch:", error);
      router.replace("/(onboarding)");
    }
  };

  return <LoadingSpinner />;
}
