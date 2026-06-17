// app/(driver)/driverRequests.tsx
import RequestCard from "@/components/RequestCard";
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

export default function DriverRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [driverLoc] = useState({ latitude: 37.78825, longitude: -122.4324 });

  // Pulse animation for the circle on the map
  const pulse = useRef(new Animated.Value(0)).current;
  const [radius, setRadius] = useState(60);

  // ← CHANGED: fetch real pending bookings from Supabase
  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (data) setRequests(data);
    };

    fetchRequests();

    // ← NEW: realtime listener — when a new booking is created,
    // it automatically appears in the driver's list without refreshing
    const channel = supabase
      .channel("pending-bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          // Only add if it's a pending booking
          if (payload.new.status === "pending") {
            setRequests((prev) => [payload.new, ...prev]);
          }
        },
      )
      .subscribe();

    // Cleanup: stop listening when screen closes
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Pulse animation setup
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]).start(loop);
    };
    loop();
  }, []);

  useEffect(() => {
    const id = pulse.addListener(({ value }) => setRadius(60 + value * 140));
    return () => pulse.removeListener(id);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Map — shows driver location only (no request pins since we store address text not coords) */}
      <View
        style={{
          height: 300,
          marginHorizontal: 12,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: driverLoc.latitude,
            longitude: driverLoc.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Circle
            center={driverLoc}
            radius={radius}
            strokeColor={COLORS.primary}
            strokeWidth={1}
            fillColor="transparent"
          />
          <Marker coordinate={driverLoc} title="You" />
          {/* ← REMOVED: request markers since DB stores address text not coordinates */}
        </MapView>
      </View>

      {/* Requests list */}
      <View style={styles.sheet}>
        <Text style={styles.title}>
          Nearby Requests{" "}
          {requests.length > 0 && (
            <Text style={styles.badge}>({requests.length})</Text>
          )}
        </Text>

        <FlatList
          data={requests}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }: { item: any }) => (
            <RequestCard
              item={item}
              onPressOpen={() =>
                router.push({
                  pathname: "/driverBooking",
                  params: { booking: JSON.stringify(item) },
                })
              }
              onPressAccept={() =>
                router.replace({
                  pathname: "/driverBooking",
                  params: { booking: JSON.stringify(item) },
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending requests right now.</Text>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, marginTop: 30 },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: -10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  badge: { color: COLORS.primary, fontSize: 16 },
  emptyText: { textAlign: "center", color: COLORS.gray, marginTop: 40 },
});
