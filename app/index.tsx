// app/index.tsx — this is the FIRST screen Expo Router loads
// Think of it as the "traffic controller" of the app
import { supabase } from "@/config/supabaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  useEffect(() => {
    const redirect = async () => {
      // Step 1: Check if already logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // User is logged in — get their role from profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", session.user.id)
          .single();

        if (profile?.role === "driver") {
          if (profile.status === "approved") {
            router.replace("/(driver)/driverHome");
          } else {
            // Pending driver — show message and go to login
            router.replace("/(auth)/login");
          }
        } else {
          router.replace("/(customer)");
        }
        return;
      }

      // Step 2: Not logged in — check if they've seen onboarding
      const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
      if (hasOnboarded === "true") {
        router.replace("/(role)");
      } else {
        router.replace("/(onboarding)");
      }
    };

    redirect();
  }, []);

  // Show spinner while deciding where to go
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
