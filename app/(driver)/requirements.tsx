import Button from "@/components/button";
import InputField from "@/components/text-Input";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function DriverRequirementsScreen() {
  const router = useRouter();
  const [carModel, setCarModel] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [mode, setMode] = useState(""); // car | motorcycle | van

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalType, setModalType] = useState("confirmation"); // 'confirmation' | 'error'

  const handleSubmit = () => {
    if (!carModel || !licenseNumber || !mode) {
      setModalType("error");
      setShowConfirmModal(true);
      return;
    }
    setModalType("confirmation");
    setShowConfirmModal(true);
  };

  const confirmContinue = () => {
    setShowConfirmModal(false);
    router.push("/(driver)/driverHome");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Driver Requirements</Text>
          <Text style={styles.subtitle}>
            Please provide your vehicle and license information to proceed.
          </Text>

          {/* Car Model */}
          <InputField
            placeholder="Car Model (e.g., Toyota Corolla)"
            value={carModel}
            onChangeText={setCarModel}
            icon="truck"
          />

          {/* License Number */}
          <InputField
            placeholder="License Number"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
            icon="file-text"
          />

          {/* Vehicle Mode Selection */}
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <View style={styles.modeContainer}>
            {["Car", "Motorcycle", "Van"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.modeButton,
                  mode === type && styles.modeButtonSelected,
                ]}
                onPress={() => setMode(type)}
              >
                <Text
                  style={[
                    styles.modeText,
                    mode === type && styles.modeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <Button style={styles.button} onPress={handleSubmit} label="Continue" />

          {/* Modal */}
          <Modal visible={showConfirmModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {modalType === "error" ? "Missing Information" : "Confirm Details"}
                </Text>
                <Text style={styles.modalMessage}>
                  {modalType === "error"
                    ? "Please fill all fields before continuing."
                    : "Are you sure you want to proceed with the entered details?"}
                </Text>

                <View style={styles.modalActions}>
                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={{ color: COLORS.white }}>Close</Text>
                  </TouchableOpacity>

                  {/* Continue Button (only for confirmation) */}
                  {modalType === "confirmation" && (
                    <TouchableOpacity
                      style={styles.modalBtn}
                      onPress={confirmContinue}
                    >
                      <Text style={{ color: COLORS.white }}>Continue</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    marginVertical: 16,
    color: COLORS.black,
  },
  modeContainer: {
    flexDirection: "row",
    marginTop: 6,
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  modeButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  modeText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  modeTextSelected: {
    color: COLORS.white,
    fontSize: FONTS.size.medium,
    fontWeight: "bold",
  },
  button: {
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
});
