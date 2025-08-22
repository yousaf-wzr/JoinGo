// screens/driver/DriverProfileScreen.tsx
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { router } from "expo-router";
import React from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DriverProfileScreen() {
  const profileInfo = () => {
    router.push("/driverProfileInfo"); // navigates to edit screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.circleImageWrapper}>
            <Image
              source={{
                uri: "https://randomuser.me/api/portraits/men/45.jpg",
              }}
              style={styles.circleImage}
            />
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.vehicleInfo}>Toyota Corolla • ABC-123</Text>
        </View>

        {/* Info Section */}
        <TouchableOpacity style={styles.section} onPress={profileInfo}>
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
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  circleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
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
