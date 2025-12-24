import { Stack } from "expo-router";

export default function DealsLayout() {
  return (
    <Stack>
      {/* 1. Static List Screen */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* 2. Dynamic ID Route - Catch-all for anything else */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Deal Details",
        }}
      />
    </Stack>
  );
}
