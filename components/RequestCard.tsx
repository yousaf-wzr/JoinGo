// components/RequestCard.tsx
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { faCircle, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  item: any;
  onPressAccept?: () => void;
  onPressOpen?: () => void;
};

const RequestCard: React.FC<Props> = ({ item, onPressAccept, onPressOpen }) => {
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");

  const handleCounterOffer = async () => {
    if (!counterPrice || isNaN(Number(counterPrice))) {
      Alert.alert("Error", "Please enter a valid price.");
      return;
    }

    await supabase
      .from("bookings")
      .update({
        counter_price: Number(counterPrice),
        negotiation_status: "countered",
      })
      .eq("id", item.id);

    setShowCounterModal(false);
    Alert.alert(
      "Counter Sent! ✅",
      `You offered ₨${counterPrice} to the customer.`,
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPressOpen}
    >
      {/* Top row — vehicle type + price */}
      <View style={styles.topRow}>
        <View style={styles.vehicleBadge}>
          <Text style={styles.vehicleBadgeText}>
            {item.vehicle_type || "Car"}
          </Text>
        </View>
        <Text style={styles.price}>₨{item.price}</Text>
      </View>

      {/* ── Route: From → To, clearly laid out ── */}
      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <FontAwesomeIcon icon={faCircle} size={10} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.routeLabel}>PICKUP</Text>
            <Text style={styles.routeText} numberOfLines={2}>
              {item.pickup || "Not specified"}
            </Text>
          </View>
        </View>

        {/* Connecting line */}
        <View style={styles.connector} />

        <View style={styles.routeRow}>
          <FontAwesomeIcon icon={faLocationDot} size={12} color="#dc2626" />
          <View style={{ flex: 1 }}>
            <Text style={styles.routeLabel}>DROP-OFF</Text>
            <Text style={styles.routeText} numberOfLines={2}>
              {item.dropoff || "Not specified"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.acceptBtn} onPress={onPressAccept}>
          <Text style={styles.acceptText}>✓ Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => {
            setCounterPrice(String(item.price));
            setShowCounterModal(true);
          }}
        >
          <Text style={styles.counterText}>₨ Counter</Text>
        </TouchableOpacity>
      </View>

      {/* Counter Offer Modal */}
      <Modal visible={showCounterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Make a Counter Offer</Text>
            <Text style={styles.modalSub}>
              Customer's price:{" "}
              <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                ₨{item.price}
              </Text>
            </Text>

            <TextInput
              style={styles.input}
              value={counterPrice}
              onChangeText={setCounterPrice}
              keyboardType="numeric"
              placeholder="Enter your price"
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.lightGray }]}
                onPress={() => setShowCounterModal(false)}
              >
                <Text style={{ color: COLORS.black, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                onPress={handleCounterOffer}
              >
                <Text style={{ color: COLORS.white, fontWeight: "600" }}>
                  Send Offer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default RequestCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  vehicleBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vehicleBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  price: { fontSize: 18, fontWeight: "800", color: COLORS.primary },

  routeContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  routeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  connector: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.gray,
    marginLeft: 4.5,
    marginVertical: 2,
  },
  routeLabel: {
    fontSize: 10,
    color: COLORS.gray,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  routeText: {
    fontSize: 14,
    color: COLORS.black,
    fontFamily: FONTS.medium,
    marginTop: 2,
  },

  btnRow: { flexDirection: "row", gap: 10 },
  acceptBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  counterBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  counterText: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 6,
    textAlign: "center",
  },
  modalSub: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: COLORS.black,
  },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
});
