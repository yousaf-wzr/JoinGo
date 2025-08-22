// app/driverBooking.tsx
import COLORS from "@/constants/color";
import { faCircleCheck, faCommentDots, faFlagCheckered, faPhone, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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

// simple haversine
const haversine = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

export default function DriverBooking() {
  const { booking } = useLocalSearchParams();
  const data = booking ? JSON.parse(booking as string) : {};
  const router = useRouter();

  const passenger = {
    name: data?.passengerName || "Rider",
    avatar: data?.avatar || "https://randomuser.me/api/portraits/women/44.jpg",
    phone: data?.phone || "03001234567",
  };

  // coords
  const pickup = { latitude: Number(data?.pickupLat ?? 37.78925), longitude: Number(data?.pickupLng ?? -122.4314) };
  const dropoff = { latitude: Number(data?.dropoffLat ?? pickup.latitude + 0.02), longitude: Number(data?.dropoffLng ?? pickup.longitude + 0.02) };
  const [driver, setDriver] = useState({ latitude: pickup.latitude - 0.01, longitude: pickup.longitude - 0.01 });

  const [stage, setStage] = useState<"toPickup" | "toDropoff" | "completed">("toPickup");
  const [eta, setEta] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const mapRef = useRef<MapView>(null);

  // driver smoothly moves toward target (pickup or dropoff)
  useEffect(() => {
    const interval = setInterval(() => {
      const target = stage === "toPickup" ? pickup : dropoff;
      setDriver((prev) => ({
        latitude: prev.latitude + (target.latitude - prev.latitude) * 0.06,
        longitude: prev.longitude + (target.longitude - prev.longitude) * 0.06,
      }));
    }, 1400);
    return () => clearInterval(interval);
  }, [stage]);

  // recompute ETA
  useEffect(() => {
    const target = stage === "toPickup" ? pickup : dropoff;
    const km = haversine(driver, target);
    // 25 km/h ~ city speed
    setEta(Math.max(1, Math.round((km / 25) * 60)));
  }, [driver, stage]);

  // pulse on driver marker
  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  // fit markers on mount and on stage change
  const fit = () => {
    const coords = stage === "toPickup" ? [driver, pickup] : [driver, pickup, dropoff];
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 120, bottom: 300, left: 80, right: 80 },
      animated: true,
    });
  };
  useEffect(() => {
    const t = setTimeout(fit, 300);
    return () => clearTimeout(t);
  }, [driver, stage]);

  const onCall = async () => {
    try {
      const url = `tel:${passenger.phone}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert("Error", "Phone call not supported on this device");
    } catch (e) {}
  };

  const onChat = () => {
    router.push(`/chat?rider=${encodeURIComponent(passenger.name)}`);
  };

  const onStartTrip = () => setStage("toDropoff");
  const onCompleteTrip = () => setShowComplete(true);
  const confirmComplete = () => {
    setShowComplete(false);
    setStage("completed");
    Alert.alert("Success", "Trip completed.");
    router.replace("/driverHome");
  };

  const price = data?.price ?? "—";
  const routeCoords = stage === "toPickup" ? [driver, pickup] : [driver, dropoff];

  return (
    <SafeAreaView style={styles.container}>
      {/* Passenger Header */}
      <View style={styles.header}>
        <Image source={{ uri: passenger.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{passenger.name}</Text>
          <Text style={styles.tripLine} numberOfLines={1}>
            {data?.pickup || "Pickup"} → {data?.dropoff || "Drop-off"}
          </Text>
          <Text style={styles.subtle}>{stage === "toPickup" ? "Heading to pickup" : "Heading to drop-off"}</Text>
        </View>
        <View>
          <Text style={styles.price}>₨{price}</Text>
          <Text style={styles.eta}>ETA: {eta} min</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: driver.latitude,
            longitude: driver.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {/* Driver marker with pulse */}
          <Marker coordinate={driver} title="You">
            <View style={{ alignItems: "center" }}>
              <Animated.View
                style={{
                  position: "absolute",
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: COLORS.primary,
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                }}
              />
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: COLORS.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: COLORS.white,
                }}
              >
                <FontAwesomeIcon icon={faFlagCheckered} size={16} color={COLORS.white} />
              </View>
            </View>
          </Marker>

          <Marker coordinate={pickup} title="Pickup" />
          {stage !== "toPickup" && <Marker coordinate={dropoff} title="Drop-off" />}

          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={COLORS.primary} />
        </MapView>
      </View>

      {/* Bottom actions */}
      <View style={styles.bottom}>
        {stage === "toPickup" ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={onStartTrip}>
            <FontAwesomeIcon icon={faFlagCheckered} color={COLORS.white} />
            <Text style={styles.primaryText}>Start Trip</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "green" }]} onPress={onCompleteTrip}>
            <FontAwesomeIcon icon={faCircleCheck} color={COLORS.white} />
            <Text style={styles.primaryText}>Complete Trip</Text>
          </TouchableOpacity>
        )}

        <View style={styles.row}>
          <TouchableOpacity style={styles.smallBtn} onPress={onCall}>
            <FontAwesomeIcon icon={faPhone} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallBtn} onPress={onChat}>
            <FontAwesomeIcon icon={faCommentDots} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallBtn, { backgroundColor: "#ef4444" }]}
            onPress={() => router.replace("/driverHome")}
          >
            <FontAwesomeIcon icon={faXmark} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Complete modal */}
      <Modal visible={showComplete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Complete Trip?</Text>
            <Text style={styles.modalText}>Confirm to finish and return to dashboard.</Text>
            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.lightGray }]} onPress={() => setShowComplete(false)}>
                <Text>Not Yet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} onPress={confirmComplete}>
                <Text style={{ color: COLORS.white }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, marginTop: 30 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    margin: 12,
    padding: 12,
    borderRadius: 12,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 10 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.black },
  tripLine: { fontSize: 13, color: COLORS.gray, marginTop: 2, maxWidth: 210 },
  subtle: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  price: { fontSize: 16, color: COLORS.primary, fontWeight: "700", textAlign: "right" },
  eta: { fontSize: 12, color: COLORS.gray, textAlign: "right", marginTop: 2 },

  mapWrap: { height: 420, borderRadius: 12, overflow: "hidden", marginHorizontal: 12, marginBottom: 10 },

  bottom: { paddingHorizontal: 12, paddingBottom: 16 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryText: { color: COLORS.white, fontWeight: "700" },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 10, gap: 8 },
  smallBtn: { backgroundColor: COLORS.primary, padding: 12, borderRadius: 10 },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.35)" },
  modalBox: { backgroundColor: COLORS.white, width: "80%", borderRadius: 12, padding: 16 },
  modalTitle: { fontWeight: "700", fontSize: 16, marginBottom: 6, textAlign: "center" },
  modalText: { textAlign: "center", color: COLORS.gray, marginBottom: 12 },
  modalRow: { flexDirection: "row", gap: 8 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
});
