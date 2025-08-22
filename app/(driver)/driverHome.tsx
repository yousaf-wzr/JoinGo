// app/driverHome.tsx
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { faCarSide, faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

const randomWithin = (center: number, delta = 0.02) => center + (Math.random() - 0.5) * delta;

export default function DriverHome() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [driverLoc, setDriverLoc] = useState({ latitude: 37.78825, longitude: -122.4324 });
  const [requests, setRequests] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);

  // Simulate incoming nearby requests
  useEffect(() => {
    if (!isOnline) return setRequests([]);
    const gen = () =>
      Array.from({ length: 6 }).map((_, i) => {
        const pickupLat = randomWithin(driverLoc.latitude, 0.02);
        const pickupLng = randomWithin(driverLoc.longitude, 0.02);
        const dstLat = pickupLat + (Math.random() - 0.5) * 0.05;
        const dstLng = pickupLng + (Math.random() - 0.5) * 0.05;
        const distanceKm = Math.max(1, Math.sqrt((dstLat - pickupLat) ** 2 + (dstLng - pickupLng) ** 2) * 111);
        return {
          id: i + 1,
          passengerName: `Rider ${i + 1}`,
          pickup: `Pickup spot ${i + 1}`,
          dropoff: `Drop-off ${i + 1}`,
          price: Math.round(distanceKm * (100 + Math.random() * 50)),
          eta: Math.floor(3 + Math.random() * 10),
          distanceKm,
          pickupLat,
          pickupLng,
          dropoffLat: dstLat,
          dropoffLng: dstLng,
        };
      });
    setRequests(gen());
  }, [isOnline]);

  // Fit markers
  useEffect(() => {
    if (!mapRef.current || requests.length === 0) return;
    mapRef.current.fitToCoordinates(
      [
        { latitude: driverLoc.latitude, longitude: driverLoc.longitude },
        ...requests.map((r) => ({ latitude: r.pickupLat, longitude: r.pickupLng })),
      ],
      { edgePadding: { top: 120, bottom: 180, left: 100, right: 100 }, animated: true }
    );
  }, [requests]);

  const statusText = useMemo(() => (isOnline ? "Online" : "Offline"), [isOnline]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <TouchableOpacity style={styles.onlineBtn} onPress={() => setIsOnline((v) => !v)}>
          <FontAwesomeIcon icon={isOnline ? faToggleOn : faToggleOff} size={22} color={COLORS.white} />
          <Text style={styles.onlineText}>{statusText}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: driverLoc.latitude,
            longitude: driverLoc.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={driverLoc} title="You">
            <FontAwesomeIcon icon={faCarSide} size={26} color={COLORS.primary} />
          </Marker>

          {requests.map((r) => (
            <Marker key={r.id} coordinate={{ latitude: r.pickupLat, longitude: r.pickupLng }} title={r.passengerName} />
          ))}
        </MapView>
      </View>

      <TouchableOpacity
        style={styles.cta}
        onPress={() =>
          router.push({
            pathname: "/driverRequests",
            params: { items: JSON.stringify(requests) },
          })
        }
        disabled={!isOnline}
      >
        <Text style={styles.ctaText}>{isOnline ? "View Requests" : "Go Online to Receive Requests"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, marginTop: 30 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  title: { fontSize: FONTS.size.large, fontWeight: "700", color: COLORS.black },
  onlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  onlineText: { color: COLORS.white, fontWeight: "700" },
  mapWrap: { height: 380, borderRadius: 12, overflow: "hidden", marginHorizontal: 16, marginBottom: 10 },
  cta: {
    marginHorizontal: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  ctaText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
});
