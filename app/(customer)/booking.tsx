// app/(customer)/booking.tsx
//
// Live ride tracking screen for the customer.
// Shows the driver's real-time location moving toward the pickup point,
// plus booking status updates and fare negotiation, all via Supabase Realtime.

import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import {
  faCarSide,
  faCommentDots,
  faMotorcycle,
  faPhone,
  faTruckPickup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

// Calculates straight-line distance between two coordinates, in kilometers
function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinHalfDLat = Math.sin(dLat / 2);
  const sinHalfDLon = Math.sin(dLon / 2);
  const a2 =
    sinHalfDLat ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      sinHalfDLon ** 2;
  return 2 * R * Math.asin(Math.sqrt(a2));
}

export default function BookingScreen() {
  const { booking } = useLocalSearchParams();
  const router = useRouter();
  const data = booking ? JSON.parse(booking as string) : {};

  // The customer's pickup location, passed from the previous screen
  const pickupLocation = {
    latitude: Number(data.pickupLat) || 0,
    longitude: Number(data.pickupLng) || 0,
  };

  // Driver's live location, refreshed by polling driver_locations every few seconds
  const [driverLocation, setDriverLocation] = useState({
    latitude: Number(data.latitude) || pickupLocation.latitude,
    longitude: Number(data.longitude) || pickupLocation.longitude,
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [bookingStatus, setBookingStatus] = useState("pending");
  const [currentPrice, setCurrentPrice] = useState(data.price);
  const [counterPrice, setCounterPrice] = useState<number | null>(null);
  const mapRef = useRef<MapView>(null);

  const vehicleIcon = useMemo(() => {
    const type = (data?.vehicle?.type || "").toLowerCase();
    if (type.includes("motor")) return faMotorcycle;
    if (type.includes("van")) return faTruckPickup;
    return faCarSide;
  }, [data?.vehicle?.type]);

  // Listen for booking status and fare negotiation changes in real time
  useEffect(() => {
    if (!data.id) return;

    const channel = supabase
      .channel(`booking-status-${data.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${data.id}`,
        },
        (payload) => {
          setBookingStatus(payload.new.status);

          if (
            payload.new.negotiation_status === "countered" &&
            payload.new.counter_price
          ) {
            setCounterPrice(payload.new.counter_price);
            Alert.alert(
              "Driver Counter Offer",
              `Driver offered ₨${payload.new.counter_price} instead of ₨${data.price}. Accept?`,
              [
                { text: "Reject", style: "cancel", onPress: rejectCounter },
                {
                  text: "Accept",
                  onPress: () => acceptCounter(payload.new.counter_price),
                },
              ],
            );
          }

          if (payload.new.status === "accepted") {
            Alert.alert("Driver Accepted", "Your driver is on the way.");
          } else if (payload.new.status === "completed") {
            Alert.alert("Trip Completed", "Hope you had a great ride!");
            router.replace("/(customer)");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [data.id]);

  // Poll the driver's live GPS location every 4 seconds
  // (driverHome.tsx writes to this same table while the driver is online)
  useEffect(() => {
    if (!data.driverId) return;

    const fetchDriverLocation = async () => {
      const { data: location } = await supabase
        .from("driver_locations")
        .select("latitude, longitude")
        .eq("driver_id", data.driverId)
        .single();

      if (location) {
        setDriverLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    };

    fetchDriverLocation();
    const interval = setInterval(fetchDriverLocation, 4000);
    return () => clearInterval(interval);
  }, [data.driverId]);

  // Recalculate ETA whenever the driver's position updates
  useEffect(() => {
    const km = distanceKm(driverLocation, pickupLocation);
    setEtaMinutes(Math.max(1, Math.round((km / 25) * 60))); // assumes ~25 km/h average city speed
  }, [driverLocation]);

  // Keep both markers visible on screen as the driver moves
  useEffect(() => {
    const timeout = setTimeout(() => {
      mapRef.current?.fitToCoordinates([driverLocation, pickupLocation], {
        edgePadding: { top: 60, bottom: 60, left: 60, right: 60 },
        animated: true,
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [driverLocation]);

  const acceptCounter = async (newPrice: number) => {
    await supabase
      .from("bookings")
      .update({ price: newPrice, negotiation_status: "accepted" })
      .eq("id", data.id);
    setCurrentPrice(newPrice);
    setCounterPrice(null);
  };

  const rejectCounter = async () => {
    await supabase
      .from("bookings")
      .update({ negotiation_status: "rejected", counter_price: null })
      .eq("id", data.id);
    setCounterPrice(null);
  };

  const cancelBooking = async () => {
    setShowCancelModal(false);
    if (data.id) {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", data.id);
    }
    router.replace("/(customer)");
  };

  const isAccepted = bookingStatus === "accepted";

  // Calling and chat only make sense once a driver has actually accepted the ride
  const onCall = async () => {
    if (!isAccepted) {
      Alert.alert("Not Yet", "You can call once the driver accepts your ride.");
      return;
    }
    const url = `tel:${data?.phone || "03001234567"}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert("Error", "Phone calls are not supported on this device.");
  };

  const onChat = () => {
    if (!isAccepted) {
      Alert.alert("Not Yet", "You can chat once the driver accepts your ride.");
      return;
    }
    router.push(`/chat?booking=${encodeURIComponent(JSON.stringify(data))}`);
  };

  const statusColor = isAccepted
    ? "#16a34a"
    : bookingStatus === "cancelled"
      ? "#dc2626"
      : COLORS.primary;
  const statusLabel = isAccepted
    ? "Driver is on the way"
    : bookingStatus === "cancelled"
      ? "Booking Cancelled"
      : "Waiting for driver to accept...";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={[styles.statusBanner, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={pickupLocation}
            title="Pickup location"
            pinColor={COLORS.primary}
          />

          <Marker coordinate={driverLocation} title="Driver">
            <View style={styles.driverMarker}>
              <FontAwesomeIcon
                icon={vehicleIcon}
                size={18}
                color={COLORS.white}
              />
            </View>
          </Marker>

          {/* Straight-line route between driver and pickup point */}
          <Polyline
            coordinates={[driverLocation, pickupLocation]}
            strokeWidth={3}
            strokeColor={COLORS.primary}
          />
        </MapView>
      </View>

      <View style={styles.card}>
        <View style={styles.driverRow}>
          <Image
            source={{
              uri: data.image || "https://www.gravatar.com/avatar/?d=mp&s=100",
            }}
            style={styles.driverImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>
              {data?.driverName || "Driver"}
            </Text>
            <Text style={styles.driverSub}>
              ⭐ {data?.rating || "5.0"} · {data?.vehicle?.color || ""}{" "}
              {data?.vehicle?.type || "Car"} · {data?.vehicle?.plate || "N/A"}
            </Text>
          </View>
          <View style={styles.etaBadge}>
            <Text style={styles.etaNum}>{etaMinutes}</Text>
            <Text style={styles.etaLabel}>min</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {counterPrice ? "Counter Offer Pending" : "Estimated Fare"}
          </Text>
          <Text style={styles.priceValue}>
            ₨ {counterPrice ?? currentPrice ?? "—"}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, !isAccepted && styles.actionBtnDisabled]}
            onPress={onCall}
          >
            <FontAwesomeIcon icon={faPhone} size={18} color={COLORS.white} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, !isAccepted && styles.actionBtnDisabled]}
            onPress={onChat}
          >
            <FontAwesomeIcon
              icon={faCommentDots}
              size={18}
              color={COLORS.white}
            />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#dc2626" }]}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {!isAccepted && (
          <Text style={styles.hint}>
            Call and Chat unlock once the driver accepts
          </Text>
        )}
      </View>

      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Cancel Booking?</Text>
            <Text style={styles.modalMsg}>
              Are you sure you want to cancel this ride?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.lightGray }]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={{ color: COLORS.black, fontWeight: "600" }}>
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#dc2626" }]}
                onPress={cancelBooking}
              >
                <Text style={{ color: COLORS.white, fontWeight: "600" }}>
                  Yes, Cancel
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
  container: { flex: 1, backgroundColor: COLORS.white },
  statusBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  statusText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  driverMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  driverRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  driverImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  driverName: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  driverSub: { fontSize: 12, color: COLORS.gray, marginTop: 3 },
  etaBadge: {
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  etaNum: { fontSize: 20, fontWeight: "700", color: COLORS.primary },
  etaLabel: { fontSize: 11, color: COLORS.gray },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  priceLabel: { fontSize: 14, color: COLORS.gray, fontFamily: FONTS.medium },
  priceValue: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
  },
  actionBtnDisabled: { backgroundColor: COLORS.gray, opacity: 0.6 },
  actionText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  hint: { textAlign: "center", color: COLORS.gray, fontSize: 12, marginTop: 8 },
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
    width: "82%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  modalMsg: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 20,
  },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
});
