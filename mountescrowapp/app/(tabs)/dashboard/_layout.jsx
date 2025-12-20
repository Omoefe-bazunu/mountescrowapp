import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContexts"; // Import useAuth
import EmailVerificationBanner from "../../../components/EmailVerificationBanner";
import { View, ActivityIndicator } from "react-native";

const TopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function DashboardSubLayout() {
  const { colors } = useTheme();
  const { user, loading } = useAuth();

  // Guard against flickering: If the user isn't logged in,
  // don't render the dashboard tabs yet.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If not logged in, return null (the global NavigationGuard will handle the redirect)
  if (!user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <EmailVerificationBanner />

      <TopTabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            textTransform: "none",
          },
          tabBarScrollEnabled: true,
          tabBarStyle: {
            backgroundColor: colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        }}
      >
        <TopTabs.Screen name="index" options={{ title: "Overview" }} />
        <TopTabs.Screen name="proposals" options={{ title: "Proposals" }} />
        <TopTabs.Screen name="deals" options={{ title: "Deals" }} />
        <TopTabs.Screen name="wallet" options={{ title: "Wallet" }} />
        <TopTabs.Screen name="disputes" options={{ title: "Disputes" }} />
      </TopTabs>
    </View>
  );
}
