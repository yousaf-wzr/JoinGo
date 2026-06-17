// app/_layout.tsx
import { useLoadFonts } from "@/hooks/useFontsload";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ← NEW
import { router, Stack } from "expo-router";
import { useEffect } from "react"; // ← NEW
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useLoadFonts();

  // ← NEW: runs once when app starts
  // Checks if user has already seen onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      // Read the sticky note we left in AsyncStorage
      const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");

      if (hasOnboarded === "true") {
        // Already seen onboarding → go straight to role selection
        router.replace("/(role)");
      }
      // If null → first time opening app → show onboarding (default behavior)
    };

    if (fontsLoaded) checkOnboarding(); // only run after fonts are ready
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(role)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(customer)" options={{ headerShown: false }} />
      <Stack.Screen name="(driver)" options={{ headerShown: false }} />
    </Stack>
  );
}
