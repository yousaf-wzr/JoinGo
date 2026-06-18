// app/(customer)/booking.tsx
import { supabase } from "@/config/supabaseConfig"; // ← NEW
import COLORS from "@/constants/color";
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
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const haversine = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

export default function BookingScreen() {
  const { booking } = useLocalSearchParams();
  const router = useRouter();
  const data = booking ? JSON.parse(booking as string) : {};

  const vehicleIcon = useMemo(() => {
    const t = (data?.vehicle?.type || "").toLowerCase();
    if (t.includes("motor")) return faMotorcycle;
    if (t.includes("van") || t.includes("pickup")) return faTruckPickup;
    return faCarSide;
  }, [data?.vehicle?.type]);

  const [passengerLocation] = useState({
    latitude: 37.78925,
    longitude: -122.4324,
  });
  const [driverLocation, setDriverLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [bookingStatus, setBookingStatus] = useState("pending"); // ← NEW: track status

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  // ← NEW: listen for booking status changes in realtime
  // When driver accepts → customer sees "Driver accepted!" instantly
  useEffect(() => {
    if (!data.id) return;

    const channel = supabase
      .channel("booking-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${data.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setBookingStatus(newStatus);

          if (newStatus === "accepted") {
            Alert.alert("Driver Accepted! 🎉", "Your driver is on the way.");
          } else if (newStatus === "completed") {
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

  // Smooth driver movement toward passenger
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLocation((prev) => ({
        latitude:
          prev.latitude + (passengerLocation.latitude - prev.latitude) * 0.05,
        longitude:
          prev.longitude +
          (passengerLocation.longitude - prev.longitude) * 0.05,
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [passengerLocation]);

  // Calculate ETA
  useEffect(() => {
    const distanceKm = haversine(driverLocation, passengerLocation);
    setEtaMinutes(Math.max(1, Math.round((distanceKm / 25) * 60)));
  }, [driverLocation]);

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  // Fit both markers on map
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates([driverLocation, passengerLocation], {
        edgePadding: { top: 120, bottom: 250, left: 60, right: 60 },
        animated: true,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [driverLocation, passengerLocation]);

  const phone = data?.phone || "03001234567";

  const onCall = async () => {
    try {
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert("Error", "Phone call not supported on this device");
    } catch (err) {
      console.log(err);
    }
  };

  const onChat = () => {
    router.push(`/chat?booking=${encodeURIComponent(JSON.stringify(data))}`);
  };

  // ← CHANGED: now updates status in Supabase to "cancelled"
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

  const routeCoords = [driverLocation, passengerLocation];

  return (
    <SafeAreaView style={styles.container}>
      {/* Status banner */}
      {bookingStatus === "pending" && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>
            ⏳ Waiting for driver to accept...
          </Text>
        </View>
      )}
      {bookingStatus === "accepted" && (
        <View style={[styles.statusBanner, { backgroundColor: "green" }]}>
          <Text style={styles.statusText}>✅ Driver is on the way!</Text>
        </View>
      )}

      {/* Driver Header */}
      <View style={styles.header}>
        <Image source={{ uri: data.image }} style={styles.driverImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.driverName}>{data?.driverName || "Driver"}</Text>
          <Text style={styles.driverRating}>
            ⭐ {data?.rating || 5} / 5 · On the way
          </Text>
          <Text style={styles.vehicle}>
            {(data?.vehicle?.color || "").trim()}{" "}
            {(data?.vehicle?.type || "Car").trim()} •{" "}
            {data?.vehicle?.plate || "N/A"}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={passengerLocation}
            title="You"
            pinColor={COLORS.primary}
          />
          <Marker coordinate={driverLocation} title="Driver">
            <FontAwesomeIcon
              icon={vehicleIcon}
              size={24}
              color={COLORS.primary}
            />
          </Marker>
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor={COLORS.primary}
          />
        </MapView>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.rowBetween}>
          <Text style={styles.eta}>ETA: {etaMinutes} min</Text>
          <Text style={styles.price}>₨{data.price ?? "—"}</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={onCall}
          >
            <FontAwesomeIcon icon={faPhone} color={COLORS.white} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={onChat}
          >
            <FontAwesomeIcon icon={faCommentDots} color={COLORS.white} />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setShowCancelModal(true)}
      >
        <Text style={styles.cancelText}>Cancel Booking</Text>
      </TouchableOpacity>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.lightGray }]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={{ color: COLORS.black }}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                onPress={cancelBooking}
              >
                <Text style={{ color: COLORS.white }}>Yes, Cancel</Text>
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
    backgroundColor: COLORS.primary,
    padding: 10,
    alignItems: "center",
  },
  statusText: { color: COLORS.white, fontWeight: "600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.lightGray,
    margin: 10,
    borderRadius: 12,
  },
  driverImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  driverName: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  driverRating: { fontSize: 14, color: COLORS.gray, marginTop: 2 },
  vehicle: { fontSize: 14, color: COLORS.gray, marginTop: 2 },
  mapContainer: {
    height: 420,
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: { flex: 1 },
  bottomSheet: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
    marginHorizontal: 10,
    marginBottom: 70,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eta: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  price: { fontSize: 16, color: COLORS.gray },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 4,
    gap: 6,
  },
  actionText: { color: COLORS.white, fontWeight: "bold" },
  cancelButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "red",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  cancelText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
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
  modalMessage: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  modalActions: { flexDirection: "row", justifyContent: "space-around" },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
});
