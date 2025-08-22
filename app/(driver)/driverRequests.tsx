// app/driverRequests.tsx
import RequestCard from "@/components/RequestCard";
import COLORS from "@/constants/color";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";


export default function DriverRequests() {
  const router = useRouter();
  const { items } = useLocalSearchParams();
  const initial = Array.isArray(items) ? JSON.parse(items[0] ?? "[]") : JSON.parse((items as string) ?? "[]");

  const [requests, setRequests] = useState<any[]>(initial);
  const [driverLoc] = useState({ latitude: 37.78825, longitude: -122.4324 });

  // Pulsing ring around driver
  const pulse = useRef(new Animated.Value(0)).current;
  const [radius, setRadius] = useState(60);

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: false }),
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
      <View style={{ height: 300, marginHorizontal: 12, borderRadius: 12, overflow: "hidden" }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: driverLoc.latitude,
            longitude: driverLoc.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Circle center={driverLoc} radius={radius} strokeColor={COLORS.primary} strokeWidth={1} fillColor="transparent" />
          <Marker coordinate={driverLoc} title="You" />
          {requests.map((r) => (
            <Marker key={r.id} coordinate={{ latitude: r.pickupLat, longitude: r.pickupLng }} title={r.passengerName} />
          ))}
        </MapView>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.title}>Nearby Requests</Text>
        <FlatList
          data={requests}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              onPressOpen={() =>
                router.push({ pathname: "/driverBooking", params: { booking: JSON.stringify(item) } })
              }
              onPressAccept={() =>
                router.replace({ pathname: "/driverBooking", params: { booking: JSON.stringify(item) } })
              }
            />
          )}
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
});
