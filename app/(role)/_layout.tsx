// app/(role)/_layout.tsx
//
// Without this file, Expo Router falls back to its default stack header
// for this route, which is why "(role)/index" was showing at the top.

import { Stack } from "expo-router";

export default function RoleLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
