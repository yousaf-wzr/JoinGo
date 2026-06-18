// app/(driver)/driverProfile.tsx
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DriverProfileScreen() {
  const [username, setUsername] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");

  // Fetch real driver profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, car_model, license_number")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.full_name);
        setVehicleInfo(
          profile.car_model && profile.license_number
            ? `${profile.car_model} • ${profile.license_number}`
            : "No vehicle info yet",
        );
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/(role)");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.circleImageWrapper}>
            <Image
              source={{ uri: "https://www.gravatar.com/avatar/?d=mp&s=250" }}
              style={styles.circleImage}
            />
          </View>
          <Text style={styles.profileName}>{username || "Loading..."}</Text>
          <Text style={styles.vehicleInfo}>{vehicleInfo}</Text>
        </View>

        {/* Info Section */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => router.push("/driverProfileInfo")}
        >
          <Text style={styles.sectionTitle}>Information</Text>
          <Text style={styles.sectionItem}>
            View and update your account & vehicle details
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
  vehicleInfo: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginTop: 5,
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
  logoutButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: { color: COLORS.white, fontFamily: FONTS.bold },
});
