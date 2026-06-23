// components/offerCard.tsx
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import {
  faCarSide,
  faMotorcycle,
  faTruckPickup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const VehicleIcon = ({
  type,
  size = 24,
}: {
  type: string;
  size?: number;
}) => {
  switch (type) {
    case "Motorcycle":
      return (
        <FontAwesomeIcon
          icon={faMotorcycle}
          size={size}
          color={COLORS.primary}
        />
      );
    case "Van":
      return (
        <FontAwesomeIcon
          icon={faTruckPickup}
          size={size}
          color={COLORS.primary}
        />
      );
    default:
      return (
        <FontAwesomeIcon icon={faCarSide} size={size} color={COLORS.primary} />
      );
  }
};

export default function OfferCard({
  item,
  onPressBook,
}: {
  item: any;
  onPressBook?: () => void;
}) {
  const router = useRouter();
  const [counterPrice, setCounterPrice] = useState<number | null>(null);
  const [negotiationStatus, setNegotiationStatus] = useState("none");

  useEffect(() => {
    if (!item.bookingId) return;

    const checkCounter = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("counter_price, negotiation_status")
        .eq("id", item.bookingId)
        .single();

      if (data?.counter_price) {
        setCounterPrice(data.counter_price);
        setNegotiationStatus(data.negotiation_status);
      }
    };
    checkCounter();

    const channel = supabase
      .channel(`counter-${item.bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${item.bookingId}`,
        },
        (payload) => {
          if (payload.new.counter_price) {
            setCounterPrice(payload.new.counter_price);
            setNegotiationStatus(payload.new.negotiation_status);
            Alert.alert(
              "Driver Counter Offer! 💬",
              `Driver offered ₨${payload.new.counter_price}. Accept or reject?`,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item.bookingId]);

  const acceptCounter = async () => {
    await supabase
      .from("bookings")
      .update({ negotiation_status: "accepted", price: counterPrice })
      .eq("id", item.bookingId);

    Alert.alert("Accepted! ✅", `Fare set to ₨${counterPrice}`);
    setNegotiationStatus("accepted");
  };

  const rejectCounter = async () => {
    await supabase
      .from("bookings")
      .update({ negotiation_status: "rejected", counter_price: null })
      .eq("id", item.bookingId);

    setCounterPrice(null);
    setNegotiationStatus("rejected");
    Alert.alert("Rejected", "Original fare restored.");
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/driverProfile",
            params: { driver: JSON.stringify(item) },
          })
        }
      >
        <Image source={{ uri: item.image }} style={styles.image} />
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.driverName}>{item.driverName}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
        <View style={styles.vehicleContainer}>
          <VehicleIcon type={item.vehicle.type} size={18} />
          <Text style={styles.vehicleText}>
            {item.vehicle.color} {item.vehicle.type} ({item.vehicle.plate})
          </Text>
        </View>
        <Text style={styles.distance}>
          {item.distance} km • ETA: {item.eta} min
        </Text>

        {counterPrice && negotiationStatus === "countered" ? (
          <View style={styles.counterBox}>
            <Text style={styles.originalPrice}>
              ₨{item.price} <Text style={styles.strikethrough}>original</Text>
            </Text>
            <Text style={styles.counterPriceText}>
              ₨{counterPrice}{" "}
              <Text style={{ fontSize: 11 }}>counter offer</Text>
            </Text>
            <View style={styles.counterBtns}>
              <TouchableOpacity
                style={styles.acceptCounterBtn}
                onPress={acceptCounter}
              >
                <Text style={styles.acceptCounterTxt}>✓ Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectCounterBtn}
                onPress={rejectCounter}
              >
                <Text style={styles.rejectCounterTxt}>✗ Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.price}>₨{item.price}</Text>
        )}
      </View>

      {/* Booking button — hidden while a counter offer is pending */}
      {negotiationStatus !== "countered" && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            if (onPressBook) {
              onPressBook();
            } else {
              router.push({
                pathname: "/booking",
                params: { booking: JSON.stringify(item) },
              });
            }
          }}
        >
          <Text style={styles.bookText}>Book</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  infoContainer: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: "bold", color: COLORS.black },
  rating: { fontSize: 14, color: COLORS.gray },
  vehicleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  vehicleText: { fontSize: 13, color: COLORS.gray, marginLeft: 5 },
  distance: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 5,
  },
  counterBox: { marginTop: 6 },
  originalPrice: { fontSize: 12, color: COLORS.gray },
  strikethrough: { textDecorationLine: "line-through" },
  counterPriceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f97316",
    marginTop: 2,
  },
  counterBtns: { flexDirection: "row", gap: 6, marginTop: 6 },
  acceptCounterBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptCounterTxt: { color: COLORS.white, fontWeight: "700", fontSize: 13 },
  rejectCounterBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#dc2626",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  rejectCounterTxt: { color: "#dc2626", fontWeight: "700", fontSize: 13 },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bookText: { color: COLORS.white, fontWeight: "bold" },
});
