// app/booking.tsx
import COLORS from "@/constants/color";
import {
  faCarSide,
  faCommentDots,
  faMotorcycle,
  faPhone,
  faTruckPickup
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
  View
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

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

  const [passengerLocation] = useState({ latitude: 37.78925, longitude: -122.4324 });
  const [driverLocation, setDriverLocation] = useState({ latitude: 37.78825, longitude: -122.4324 });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [etaMinutes, setEtaMinutes] = useState(0);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  // Smooth driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLocation((prev) => ({
        latitude: prev.latitude + (passengerLocation.latitude - prev.latitude) * 0.05,
        longitude: prev.longitude + (passengerLocation.longitude - prev.longitude) * 0.05,
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [passengerLocation]);

  // Calculate ETA
  useEffect(() => {
    const distanceKm = haversine(driverLocation, passengerLocation);
    setEtaMinutes(Math.max(1, Math.round((distanceKm / 25) * 60)));
  }, [driverLocation]);

  const price = data.price ?? "—";

  // Pulse animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  // Fit both markers
  const fitBoth = () => {
    mapRef.current?.fitToCoordinates([driverLocation, passengerLocation], {
      edgePadding: { top: 120, bottom: 250, left: 60, right: 60 },
      animated: true,
    });
  };
  useEffect(() => {
    const timer = setTimeout(fitBoth, 400);
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

  const routeCoords = [driverLocation, passengerLocation];
  const confirmCancel = () => setShowCancelModal(true);
  const cancelBooking = () => {
    setShowCancelModal(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Driver Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/driverProfile",
              params: { driver: JSON.stringify(data) },
            })
          }
        >
          <Image source={{ uri: data.image }} style={styles.driverImage} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.driverName}>{data?.driverName || "Driver"}</Text>
          <Text style={styles.driverRating}>⭐ {data?.rating || 5} / 5 · On the way</Text>
          <Text style={styles.vehicle}>
            {(data?.vehicle?.color || "").trim()} {(data?.vehicle?.type || "Car").trim()} • {data?.vehicle?.plate || "N/A"}
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
          <Marker coordinate={passengerLocation} title="You" pinColor={COLORS.primary} />
          <Marker coordinate={driverLocation} title="Driver">
  
              <FontAwesomeIcon icon={vehicleIcon} size={24} color={COLORS.primary} />
            
          </Marker>
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={COLORS.primary} />
        </MapView>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.rowBetween}>
          <Text style={styles.eta}>ETA: {etaMinutes} min</Text>
          <Text style={styles.price}>₨{price}</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={onCall}>
            <FontAwesomeIcon icon={faPhone} color={COLORS.white} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={onChat}>
            <FontAwesomeIcon icon={faCommentDots} color={COLORS.white} />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cancel Button */}
      <TouchableOpacity style={styles.cancelButton} onPress={confirmCancel}>
        <Text style={styles.cancelText}>Cancel Booking</Text>
      </TouchableOpacity>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <Text style={styles.modalMessage}>Are you sure you want to cancel this booking?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.lightGray }]} onPress={() => setShowCancelModal(false)}>
                <Text style={{ color: COLORS.black }}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} onPress={cancelBooking}>
                <Text style={{ color: COLORS.white }}>Yes</Text>
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
  header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: COLORS.lightGray, margin: 10, borderRadius: 12 },
  driverImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  driverName: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  driverRating: { fontSize: 14, color: COLORS.gray, marginTop: 2 },
  vehicle: { fontSize: 14, color: COLORS.gray, marginTop: 2 },

  mapContainer: { height: 500, marginHorizontal: 10, marginBottom: 15, borderRadius: 12, overflow: "hidden" },
  map: { flex: 1 },

  vehicleMarker: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.white, zIndex: 2 },
  pulse: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, zIndex: 1 },

  bottomSheet: { padding: 16, backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 5, marginHorizontal: 10, marginBottom: 70, zIndex: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eta: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  price: { fontSize: 16, color: COLORS.gray },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderRadius: 8, flex: 1, justifyContent: "center", marginHorizontal: 4, gap: 6 },
  actionText: { color: COLORS.white, fontWeight: "bold" },

  cancelButton: { position: "absolute", bottom: 10, left: 10, right: 10, backgroundColor: COLORS.primary, paddingVertical: 14, alignItems: "center", borderRadius: 12, zIndex: 1000 },
  cancelText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20, width: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  modalMessage: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  modalActions: { flexDirection: "row", justifyContent: "space-around" },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center", marginHorizontal: 5 },
});
