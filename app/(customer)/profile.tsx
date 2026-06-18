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
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TERMS = `Welcome to JoinGo!

By using our app, you agree to the following:

1. SERVICE
JoinGo connects passengers with drivers. We are not responsible for the conduct of drivers or passengers.

2. YOUR ACCOUNT
You must provide accurate information when creating an account. You are responsible for keeping your password secure.

3. PAYMENTS
All fares are calculated based on distance and vehicle type. Payments are made directly to the driver.

4. CANCELLATIONS
You may cancel a booking before the driver accepts. Repeated cancellations may result in account suspension.

5. SAFETY
JoinGo takes safety seriously. Please report any safety concerns to our support team immediately.

6. PRIVACY
We collect location data to provide our service. We do not sell your data to third parties.

7. CHANGES
We may update these terms at any time. Continued use of the app means you accept the new terms.

For questions, contact us at support@joingo.app`;

export default function ProfileScreen() {
  const [isDriver, setIsDriver] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showTerms, setShowTerms] = useState(false); // ← NEW
  const [showSupport, setShowSupport] = useState(false); // ← NEW

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
              router.replace("/(driver)/driverHome");
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

        {/* Info */}
        <TouchableOpacity
          style={styles.section}
          onPress={() => router.push("/profileInfo")}
        >
          <Text style={styles.sectionTitle}>Information</Text>
          <Text style={styles.sectionItem}>
            View and edit your account details
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

      {/* ── Terms & Conditions Modal ── */}
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
            <Text style={styles.modalTitle}>Contact Support</Text>
            <Text style={styles.supportSubtitle}>
              We're here to help! Reach us through:
            </Text>

            {/* Email */}
            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL("mailto:support@joingo.app")}
            >
              <Text style={styles.supportIcon}>📧</Text>
              <View>
                <Text style={styles.supportLabel}>Email Us</Text>
                <Text style={styles.supportValue}>support@joingo.app</Text>
              </View>
            </TouchableOpacity>

            {/* Phone */}
            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL("tel:+923085233182")}
            >
              <Text style={styles.supportIcon}>📞</Text>
              <View>
                <Text style={styles.supportLabel}>Call Us</Text>
                <Text style={styles.supportValue}>+92 3085233182</Text>
              </View>
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => Linking.openURL("https://wa.me/923349052910")}
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

  // Modal shared styles
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

  // Support styles
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
