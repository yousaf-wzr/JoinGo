import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function ProfileScreen() {
  const [isDriver, setIsDriver] = useState(false);

  const profileInfo = () => {
    router.replace("/profileInfo");
  };

  // Navigate to driver screen when toggled ON
  useEffect(() => {
    if (isDriver) {
      router.replace("/driver");
    }
  }, [isDriver]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.circleImageWrapper}>
            <Image
              source={{
                uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=250",
              }}
              style={styles.circleImage}
            />
          </View>
          <Text style={styles.profileName}>John Doe</Text>
        </View>

        {/* Info Section */}
        <TouchableOpacity
          style={styles.section}
          onPress={profileInfo}
        >
          <Text style={styles.sectionTitle}>Information</Text>
          <Text style={styles.sectionItem}>View your account details</Text>
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

        {/* Support Section */}
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
            onValueChange={(value) => setIsDriver(value)}
            trackColor={{ false: "#ccc", true: COLORS.primary }}
            thumbColor={isDriver ? COLORS.white : "#f4f3f4"}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton}>
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
    borderRadius: 60, // half of width/height to make it a perfect circle
    overflow: "hidden", // ensures image stays inside the circle
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  circleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  profileName: { fontSize: 20, fontFamily: FONTS.bold, color: COLORS.primary, marginTop: 10 },
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
