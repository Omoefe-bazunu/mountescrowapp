import { Stack } from "expo-router";

export default function ProposalsLayout() {
  return (
    <Stack>
      {/* 1. Static List Screen */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* 2. Static 'New' Screen - MUST BE ABOVE [id] */}
      <Stack.Screen
        name="new"
        options={{
          headerShown: true,
          title: "New Proposal",
        }}
      />

      {/* 3. Dynamic ID Route - Catch-all for anything else */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Proposal Details",
        }}
      />
    </Stack>
  );
}
