// app/(driver)/driverHome.tsx
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import {
  faCarSide,
  faToggleOff,
  faToggleOn,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import * as Location from "expo-location"; // ← NEW: real GPS
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
  const [isOnline, setIsOnline] = useState(false); // ← CHANGED: start offline by default, safer
  const [driverLoc, setDriverLoc] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [requests, setRequests] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const mapRef = useRef<MapView>(null);

  // Get logged in driver's ID once
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // ← NEW: Track and broadcast driver's live GPS location while online
  useEffect(() => {
    if (!isOnline || !userId) return;

    let subscription: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // Watch position — fires every time driver moves
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 10,
        },
        async (loc) => {
          const { latitude, longitude } = loc.coords;
          setDriverLoc({ latitude, longitude });

          // Save/update this driver's location in Supabase
          // upsert = update if exists, insert if not (since driver_id is the primary key)
          await supabase.from("driver_locations").upsert({
            driver_id: userId,
            latitude,
            longitude,
            is_online: true,
            updated_at: new Date().toISOString(),
          });
        },
      );
    };

    startTracking();

    // Cleanup: stop tracking when driver goes offline or leaves screen
    return () => {
      subscription?.remove();
    };
  }, [isOnline, userId]);

  // ← NEW: When driver goes offline, mark them offline in the database
  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);

    if (!newStatus && userId) {
      await supabase
        .from("driver_locations")
        .update({ is_online: false })
        .eq("driver_id", userId);
    }
  };

  // Fetch pending requests
  useEffect(() => {
    if (!isOnline) {
      setRequests([]);
      return;
    }

    const fetchRequests = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pending");

      if (data) setRequests(data);
    };

    fetchRequests();
  }, [isOnline]);

  const statusText = useMemo(
    () => (isOnline ? "Online" : "Offline"),
    [isOnline],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Driver Dashboard</Text>
        <TouchableOpacity style={styles.onlineBtn} onPress={toggleOnline}>
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
          region={{
            latitude: driverLoc.latitude,
            longitude: driverLoc.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={driverLoc} title="You">
            <FontAwesomeIcon
              icon={faCarSide}
              size={26}
              color={COLORS.primary}
            />
          </Marker>
        </MapView>
      </View>

      {isOnline && requests.length > 0 && (
        <Text style={styles.requestCount}>
          {requests.length} ride request{requests.length > 1 ? "s" : ""} waiting
        </Text>
      )}

      {!isOnline && (
        <Text style={styles.offlineHint}>
          Go online to share your location and receive ride requests
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
  offlineHint: {
    textAlign: "center",
    color: COLORS.gray,
    marginBottom: 8,
    fontSize: 13,
    paddingHorizontal: 20,
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
