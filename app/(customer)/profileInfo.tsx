// app/profileInfo.tsx
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function ProfileInfo() {
  const [profile, setProfile] = useState({
    full_name: "John Doe",
    email: "johndoe@example.com",
    avatar_url:
      "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=250",
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempName, setTempName] = useState(profile.full_name);
  const [tempEmail, setTempEmail] = useState(profile.email);

  const saveChanges = () => {
    setProfile({ ...profile, full_name: tempName, email: tempEmail });
    setEditModalVisible(false);
  };

  const changeProfileImage = () => {
    // TODO: Open image picker logic here
    alert("Change profile image clicked!");
  };

  return (
    <SafeAreaView style={styles.container}>
 
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar with Pencil Button */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          <TouchableOpacity style={styles.editImageBtn} onPress={changeProfileImage}>
            <FontAwesome name="pencil" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Name & Email */}
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.email}>{profile.email}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Edit Profile Button */}
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
              value={tempEmail}
              onChangeText={setTempEmail}
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
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
  content: {
    alignItems: "center",
    paddingBottom: 40,
  },
  avatarContainer: {
    position: "relative",
  },
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
  email: {
    fontSize: 16,
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
  buttonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryText: {
    color: COLORS.primary,
  },
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
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
