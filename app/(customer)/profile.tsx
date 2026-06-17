import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [isDriver, setIsDriver] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Fetch real user data on screen load
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) setUsername(profile.full_name);
      // Use Gravatar with real email as fallback avatar
      setAvatarUrl(`https://www.gravatar.com/avatar/${user.email}?s=250&d=mp`);
    };

    fetchProfile();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut(); // clear the session
          router.replace("/(role)"); // go back to role screen
        },
      },
    ]);
  };

  // Driver mode toggle — ask confirmation before switching
  const handleDriverToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Switch to Driver Mode?",
        "You will be taken to the driver section.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Switch",
            onPress: () => {
              setIsDriver(true);
              router.replace("/(driver)/driverHome"); // ← FIXED: correct route
            },
          },
        ],
      );
    } else {
      setIsDriver(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.circleImageWrapper}>
            <Image
              source={{
                uri: avatarUrl || "https://www.gravatar.com/avatar/?d=mp&s=250",
              }}
              style={styles.circleImage}
            />
          </View>
          <Text style={styles.profileName}>{username || "Loading..."}</Text>
        </View>

        {/* Info Section */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => router.push("/profileInfo")}
        >
          <Text style={styles.sectionTitle}>Information</Text>
          <Text style={styles.sectionItem}>
            View and edit your account details
          </Text>
        </TouchableOpacity>

        {/* Terms & Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <TouchableOpacity style={styles.sectionButton}>
            <Text style={styles.sectionButtonText}>
              View Terms & Conditions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.sectionButton}>
            <Text style={styles.sectionButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Driver Mode */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Driver Mode</Text>
          <Switch
            value={isDriver}
            onValueChange={handleDriverToggle}
            trackColor={{ false: "#ccc", true: COLORS.primary }}
            thumbColor={isDriver ? COLORS.white : "#f4f3f4"}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: 20 },
  header: { alignItems: "center", marginVertical: 20 },
  circleImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  circleImage: { width: "100%", height: "100%", resizeMode: "cover" },
  profileName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginTop: 10,
  },
  section: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: FONTS.bold, marginBottom: 8 },
  sectionItem: { fontSize: 14, fontFamily: FONTS.medium, color: COLORS.gray },
  sectionButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  sectionButtonText: { color: COLORS.white, fontFamily: FONTS.bold },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  switchText: { fontSize: 16, fontFamily: FONTS.medium },
  logoutButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: { color: COLORS.white, fontFamily: FONTS.bold },
});
