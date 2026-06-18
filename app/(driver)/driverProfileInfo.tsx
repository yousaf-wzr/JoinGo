// app/(driver)/driverProfileInfo.tsx
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DriverProfileInfo() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    car_model: "",
    license_number: "",
    avatar_url: "https://www.gravatar.com/avatar/?d=mp&s=250",
  });

  const [userId, setUserId] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempVehicle, setTempVehicle] = useState("");
  const [tempPlate, setTempPlate] = useState("");

  // Fetch real profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("full_name, car_model, license_number")
        .eq("id", user.id)
        .single();

      const p = {
        full_name: data?.full_name || "",
        email: user.email || "",
        car_model: data?.car_model || "",
        license_number: data?.license_number || "",
        avatar_url: `https://www.gravatar.com/avatar/${user.email}?s=250&d=mp`,
      };

      setProfile(p);
      setTempName(p.full_name);
      setTempVehicle(p.car_model);
      setTempPlate(p.license_number);
    };

    fetchProfile();
  }, []);

  // Save changes to Supabase
  const saveChanges = async () => {
    if (!tempName) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: tempName,
        car_model: tempVehicle,
        license_number: tempPlate,
      })
      .eq("id", userId);

    if (error) {
      Alert.alert("Error", "Could not save changes.");
      return;
    }

    setProfile({
      ...profile,
      full_name: tempName,
      car_model: tempVehicle,
      license_number: tempPlate,
    });
    setEditModalVisible(false);
    Alert.alert("Success", "Profile updated!");
  };

  // Real image picker
  const changeProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfile({ ...profile, avatar_url: result.assets[0].uri });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          <TouchableOpacity
            style={styles.editImageBtn}
            onPress={changeProfileImage}
          >
            <FontAwesome name="pencil" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <Text style={styles.name}>{profile.full_name || "Loading..."}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <Text style={styles.vehicle}>
          {profile.car_model && profile.license_number
            ? `${profile.car_model} • ${profile.license_number}`
            : "No vehicle info yet"}
        </Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              value={tempName}
              onChangeText={setTempName}
              placeholder="Full Name"
              style={styles.input}
            />
            <TextInput
              value={profile.email}
              placeholder="Email"
              style={[styles.input, { color: COLORS.gray }]}
              editable={false}
            />
            <Text style={styles.hint}>* Email cannot be changed here</Text>
            <TextInput
              value={tempVehicle}
              onChangeText={setTempVehicle}
              placeholder="Car Model (e.g. Toyota Corolla)"
              style={styles.input}
            />
            <TextInput
              value={tempPlate}
              onChangeText={setTempPlate}
              placeholder="License Number"
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={saveChanges}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.secondaryText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  content: { alignItems: "center", paddingBottom: 40 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editImageBtn: {
    position: "absolute",
    bottom: 20,
    right: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 6,
  },
  name: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    marginBottom: 5,
    color: COLORS.black,
  },
  email: { fontSize: 16, fontFamily: FONTS.medium, color: COLORS.gray },
  vehicle: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginBottom: 20,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 12,
    minWidth: 120,
  },
  buttonText: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.white },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryText: { color: COLORS.primary },
  hint: { fontSize: 12, color: COLORS.gray, marginBottom: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: "100%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
