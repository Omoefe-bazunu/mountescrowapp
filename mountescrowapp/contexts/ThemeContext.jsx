import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

const lightColors = {
  primary: "#010e5a",
  secondary: "#00042f",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  card: "#FFFFFF",
  error: "#EF4444",
  success: "#059669",
  warning: "#F59E0B",
  skeleton: "#E0E0E0",
  skeletonHighlight: "#F5F5F5",
};

const darkColors = {
  primary: "#3B82F6",
  secondary: "#FBBF24",
  background: "#111827",
  surface: "#1F2937",
  text: "#F9FAFB",
  textSecondary: "#D1D5DB",
  border: "#374151",
  card: "#1F2937",
  error: "#F87171",
  success: "#34D399",
  warning: "#FBBF24",
  skeleton: "#374151",
  skeletonHighlight: "#4B5563",
};

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themePreference");
      if (savedTheme !== null) {
        setIsDark(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(
        "themePreference",
        newTheme ? "dark" : "light"
      );
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  const value = {
    isDark,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
