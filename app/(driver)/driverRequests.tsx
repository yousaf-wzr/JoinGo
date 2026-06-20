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
  const [userId, setUserId] = useState("");

  const [driverLoc, setDriverLoc] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const pulse = useRef(new Animated.Value(0)).current;
  const [radius, setRadius] = useState(60);

  // Get driver location + logged-in user id
  useEffect(() => {
    const fetchDriverLocation = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data } = await supabase
        .from("driver_locations")
        .select("latitude, longitude")
        .eq("driver_id", user.id)
        .single();

      if (data) {
        setDriverLoc({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } else {
        setDriverLoc({
          latitude: 37.78825,
          longitude: -122.4324,
        });
      }
    };

    fetchDriverLocation();
  }, []);

  // Fetch driver's assigned pending requests
  useEffect(() => {
    if (!userId) return;

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("driver_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("FETCH REQUESTS ERROR:", error);
        return;
      }

      if (data) {
        setRequests(data);
      }
    };

    fetchRequests();

    const channel = supabase
      .channel(`driver-bookings-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          if (
            payload.new.status === "pending" &&
            payload.new.driver_id === userId
          ) {
            setRequests((prev) => [payload.new, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Pulse animation
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
    const id = pulse.addListener(({ value }) => {
      setRadius(60 + value * 140);
    });

    return () => pulse.removeListener(id);
  }, []);

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
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              onPressOpen={() =>
                router.push({
                  pathname: "/driverBooking",
                  params: {
                    booking: JSON.stringify(item),
                  },
                })
              }
              onPressAccept={() =>
                router.replace({
                  pathname: "/driverBooking",
                  params: {
                    booking: JSON.stringify(item),
                  },
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: 30,
  },

  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: -10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  badge: {
    color: COLORS.primary,
    fontSize: 16,
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.gray,
    marginTop: 40,
  },
});
