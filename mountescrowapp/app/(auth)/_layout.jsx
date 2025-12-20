// app/(auth)/_layout.js
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../contexts/AuthContexts";

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  // While loading, show nothing (or a spinner)
  if (isLoading) {
    return null;
  }

  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect href="/" />;
  }

  //If user is not signed up then show auth screens begining with login
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
