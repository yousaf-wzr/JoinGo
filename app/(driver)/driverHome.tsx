// app/driverHome.tsx
import { supabase } from "@/config/supabaseConfig"; // ← NEW
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import {
  faCarSide,
  faToggleOff,
  faToggleOn,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function DriverHome() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [driverLoc] = useState({ latitude: 37.78825, longitude: -122.4324 });
  const [requests, setRequests] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);

  // ← CHANGED: was generating fake data, now fetches real bookings from DB
  useEffect(() => {
    // If driver goes offline, clear the list and stop
    if (!isOnline) {
      setRequests([]);
      return;
    }

    const fetchRequests = async () => {
      // Ask Supabase: "give me all bookings where status is pending"
      // These are customers waiting for a driver to accept their ride
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pending");

      if (data) setRequests(data);
    };

    fetchRequests();
  }, [isOnline]); // runs every time driver toggles online/offline

  // Fit map to show driver + all request locations
  useEffect(() => {
    if (!mapRef.current || requests.length === 0) return;
    mapRef.current.fitToCoordinates(
      [{ latitude: driverLoc.latitude, longitude: driverLoc.longitude }],
      {
        edgePadding: { top: 120, bottom: 180, left: 100, right: 100 },
        animated: true,
      },
    );
  }, [requests]);

  const statusText = useMemo(
    () => (isOnline ? "Online" : "Offline"),
    [isOnline],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <TouchableOpacity
          style={styles.onlineBtn}
          onPress={() => setIsOnline((v) => !v)}
        >
          <FontAwesomeIcon
            icon={isOnline ? faToggleOn : faToggleOff}
            size={22}
            color={COLORS.white}
          />
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
          {/* Driver's own location marker */}
          <Marker coordinate={driverLoc} title="You">
            <FontAwesomeIcon
              icon={faCarSide}
              size={26}
              color={COLORS.primary}
            />
          </Marker>
        </MapView>
      </View>

      {/* Show how many requests are waiting */}
      {isOnline && requests.length > 0 && (
        <Text style={styles.requestCount}>
          {requests.length} ride request{requests.length > 1 ? "s" : ""} waiting
        </Text>
      )}

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
        <Text style={styles.ctaText}>
          {isOnline ? "View Requests" : "Go Online to Receive Requests"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, marginTop: 30 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
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
  mapWrap: {
    height: 380,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  requestCount: {
    textAlign: "center",
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
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
