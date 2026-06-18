// app/(driver)/driverProfile.tsx
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TERMS = `Welcome to JoinGo Driver Program!

By using our app as a driver, you agree to the following:

1. ELIGIBILITY
You must have a valid driver's license and vehicle registration. Your vehicle must pass our safety inspection.

2. YOUR CONDUCT
You must treat all passengers with respect. Discrimination of any kind is strictly prohibited.

3. EARNINGS
Your earnings are based on completed trips. JoinGo takes a service fee from each fare.

4. CANCELLATIONS
Repeated cancellations may result in account suspension or termination.

5. SAFETY
You must follow all traffic laws. Passenger safety is your top priority at all times.

6. VEHICLE STANDARDS
Your vehicle must be clean, well-maintained, and roadworthy at all times.

7. APPROVAL
New driver accounts require admin approval before you can accept rides.

8. PRIVACY
We collect your location during active trips only. We do not sell your data.

For questions, contact us at drivers@joingo.app`;

export default function DriverProfileScreen() {
  const [username, setUsername] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

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
      setAvatarUrl(`https://www.gravatar.com/avatar/${user.email}?s=250&d=mp`);
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
              source={{
                uri: avatarUrl || "https://www.gravatar.com/avatar/?d=mp&s=250",
              }}
              style={styles.circleImage}
            />
          </View>
          <Text style={styles.profileName}>{username || "Loading..."}</Text>
          <Text style={styles.vehicleInfo}>{vehicleInfo}</Text>
        </View>

        {/* Info */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => router.push("/driverProfileInfo")}
        >
          <Text style={styles.sectionTitle}>Information</Text>
          <Text style={styles.sectionItem}>
            View and update your account & vehicle details
          </Text>
        </TouchableOpacity>

        {/* Terms & Conditions ← NOW FUNCTIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => setShowTerms(true)}
          >
            <Text style={styles.sectionButtonText}>
              View Terms & Conditions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Support ← NOW FUNCTIONAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => setShowSupport(true)}
          >
            <Text style={styles.sectionButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Terms Modal ── */}
      <Modal visible={showTerms} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalBody}>{TERMS}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowTerms(false)}
            >
              <Text style={styles.modalCloseTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Support Modal ── */}
      <Modal visible={showSupport} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Driver Support</Text>
            <Text style={styles.supportSubtitle}>
              Need help? We're available 24/7!
            </Text>

            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL("mailto:drivers@joingo.app")}
            >
              <Text style={styles.supportIcon}>📧</Text>
              <View>
                <Text style={styles.supportLabel}>Email Support</Text>
                <Text style={styles.supportValue}>drivers@joingo.app</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL("tel:+923085233182")}
            >
              <Text style={styles.supportIcon}>📞</Text>
              <View>
                <Text style={styles.supportLabel}>Driver Helpline</Text>
                <Text style={styles.supportValue}>+92 308523182</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL("https://wa.me/92349052910")}
            >
              <Text style={styles.supportIcon}>💬</Text>
              <View>
                <Text style={styles.supportLabel}>WhatsApp</Text>
                <Text style={styles.supportValue}>+92 3349052910</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowSupport(false)}
            >
              <Text style={styles.modalCloseTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: 12,
    textAlign: "center",
  },
  modalScroll: { maxHeight: 380 },
  modalBody: {
    fontSize: 14,
    color: COLORS.secondary,
    lineHeight: 22,
    fontFamily: FONTS.regular,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  modalCloseTxt: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: 15 },
  supportSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: FONTS.regular,
  },
  supportOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 14,
  },
  supportIcon: { fontSize: 24 },
  supportLabel: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.black },
  supportValue: {
    fontSize: 13,
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
});
