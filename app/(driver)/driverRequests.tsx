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
  const [userId, setUserId] = useState(""); // ← FIXED: was missing entirely, needed to filter "my" requests
  // ← CHANGED: starts null until we get the driver's real location
  const [driverLoc, setDriverLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const pulse = useRef(new Animated.Value(0)).current;
  const [radius, setRadius] = useState(60);

  // ← NEW: get the driver's real current location from driver_locations table
  // (this is the same location driverHome.tsx is broadcasting while online)
  useEffect(() => {
    const fetchDriverLocation = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id); // ← FIXED: now actually saves the logged-in driver's ID

      const { data } = await supabase
        .from("driver_locations")
        .select("latitude, longitude")
        .eq("driver_id", user.id)
        .single();

      if (data) {
        setDriverLoc({ latitude: data.latitude, longitude: data.longitude });
      } else {
        // Fallback only if no location found yet (e.g. driver just went online)
        setDriverLoc({ latitude: 37.78825, longitude: -122.4324 });
      }
    };

    fetchDriverLocation();
  }, []);

  useEffect(() => {
    if (!userId) return; // wait until we know who's logged in

    const fetchRequests = async () => {
      // ← FIXED: only show bookings assigned to THIS driver
      // Before, this showed ALL pending bookings system-wide, not just this driver's
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pending")
        .eq("driver_id", userId)
        .order("created_at", { ascending: false });

      if (data) setRequests(data);
    };

    fetchRequests();

    // ← FIXED: filter realtime updates to only this driver's bookings,
    // and use a unique channel name (avoids the crash pattern we fixed in chat)
    const channel = supabase
      .channel(`driver-requests-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `driver_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.status === "pending") {
            setRequests((prev) => [payload.new, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

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

  // Don't render the map until we know the driver's real location
  if (!driverLoc) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Getting your location...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        </MapView>
      </View>

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
