// components/RequestCard.tsx
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import React, { useState } from "react";
import {
  Alert,
  Image,
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

  // Driver submits a counter price
  const handleCounterOffer = async () => {
    if (!counterPrice || isNaN(Number(counterPrice))) {
      Alert.alert("Error", "Please enter a valid price.");
      return;
    }

    // Save counter price to Supabase
    await supabase
      .from("bookings")
      .update({
        counter_price: Number(counterPrice),
        negotiation_status: "countered", // customer will see this
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
      <View style={styles.row}>
        <Image
          source={{
            uri:
              item.avatar ||
              `https://randomuser.me/api/portraits/men/${10 + (item.id % 70)}.jpg`,
          }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.passengerName || "Passenger"}</Text>
          <Text style={styles.route} numberOfLines={1}>
            {item.pickup} → {item.dropoff}
          </Text>
          <Text style={styles.meta}>
            {item.distanceKm?.toFixed?.(1) || "—"} km · {item.eta || "—"} min
          </Text>
        </View>
        <Text style={styles.price}>₨{item.price}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.btnRow}>
        {/* Accept button */}
        <TouchableOpacity style={styles.acceptBtn} onPress={onPressAccept}>
          <Text style={styles.acceptText}>✓ Accept</Text>
        </TouchableOpacity>

        {/* Counter Offer button */}
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => {
            setCounterPrice(String(item.price)); // pre-fill with original price
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
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  route: { fontSize: 13, color: COLORS.gray, marginTop: 2, maxWidth: 200 },
  meta: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  price: { fontSize: 16, fontWeight: "700", color: COLORS.primary },

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
