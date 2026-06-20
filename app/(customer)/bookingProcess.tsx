// app/(customer)/bookingProcess.tsx
import OfferCard, { VehicleIcon } from "@/components/offerCard";
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export default function OffersScreen() {
  const router = useRouter();
  const { pickupLat, pickupLng, price, vehicleType, pickup, dropoff } =
    useLocalSearchParams();

  const [offers, setOffers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  const pickupPulse = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [pulseRadius, setPulseRadius] = useState(50);

  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pickupPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pickupPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]).start(() => loop());
    };
    loop();
  }, []);

  useEffect(() => {
    const id = pickupPulse.addListener(({ value }) =>
      setPulseRadius(50 + value * 150),
    );
    return () => {
      pickupPulse.removeListener(id);
    };
  }, []);

  // Find real nearby online drivers within 5km
  useEffect(() => {
    const findNearbyDrivers = async () => {
      console.log("=== DEBUG: Pickup coords ===", pickupLat, pickupLng);

      const { data: onlineDrivers } = await supabase
        .from("driver_locations")
        .select("driver_id, latitude, longitude")
        .eq("is_online", true);

      console.log("=== DEBUG: Online drivers found ===", onlineDrivers);

      if (!onlineDrivers || onlineDrivers.length === 0) {
        setOffers([]);
        setIsSearching(false);
        return;
      }

      const nearby = onlineDrivers.filter((d) => {
        const dist = distanceKm(
          Number(pickupLat),
          Number(pickupLng),
          d.latitude,
          d.longitude,
        );
        console.log(
          `=== DEBUG: Distance to driver ${d.driver_id} ===`,
          dist,
          "km",
        );
        return dist <= 5;
      });

      if (nearby.length === 0) {
        setOffers([]);
        setIsSearching(false);
        return;
      }

      const driverIds = nearby.map((d) => d.driver_id);
      console.log("=== DEBUG: Driver IDs to look up ===", driverIds);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, car_model, vehicle_type, license_number, role")
        .in("id", driverIds)
        .eq("role", "driver");

      console.log("=== DEBUG: Profiles found ===", profiles);
      console.log("=== DEBUG: Profiles error ===", profilesError);

      const realOffers = nearby
        .filter((loc) => profiles?.some((p) => p.id === loc.driver_id))
        .map((loc) => {
          const profile = profiles?.find((p) => p.id === loc.driver_id);
          const dist = distanceKm(
            Number(pickupLat),
            Number(pickupLng),
            loc.latitude,
            loc.longitude,
          );

          return {
            id: loc.driver_id,
            driverId: loc.driver_id, // ← this MUST exist for booking to reach the driver
            driverName: profile?.full_name || "Driver",
            image: `https://www.gravatar.com/avatar/${loc.driver_id}?d=mp&s=100`,
            rating: "4.8",
            price: Number(price),
            eta: Math.max(1, Math.round((dist / 30) * 60)),
            distance: dist.toFixed(1),
            latitude: loc.latitude,
            longitude: loc.longitude,
            vehicle: {
              type: profile?.vehicle_type || "Car",
              color: "",
              plate: profile?.license_number || "N/A",
            },
          };
        });

      setOffers(realOffers);
      setIsSearching(false);

      if (mapRef.current && realOffers.length > 0) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: Number(pickupLat), longitude: Number(pickupLng) },
            ...realOffers.map((o) => ({
              latitude: o.latitude,
              longitude: o.longitude,
            })),
          ],
          {
            edgePadding: { top: 180, bottom: 300, left: 150, right: 150 },
            animated: true,
          },
        );
      }
    };

    findNearbyDrivers();
  }, []);

  // ← CLEANED: removed all debug alert()/console.log(), added a real guard for missing driverId
  const handleBook = async (item: any) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "You must be logged in to book a ride.");
      return;
    }

    // ← NEW: guard — without a real driverId, the booking would never reach any driver
    if (!item.driverId) {
      Alert.alert(
        "Error",
        "This driver is no longer available. Please choose another.",
      );
      return;
    }

    const { data: newBooking, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        driver_id: item.driverId,
        pickup,
        dropoff,
        price: Number(item.price),
        vehicle_type: item.vehicle.type,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      Alert.alert("Booking Failed", error.message);
      return;
    }

    if (newBooking) {
      router.push({
        pathname: "/booking",
        params: {
          booking: JSON.stringify({
            ...item,
            id: newBooking.id,
            bookingId: newBooking.id,
          }),
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: Number(pickupLat),
            longitude: Number(pickupLng),
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Circle
            center={{
              latitude: Number(pickupLat),
              longitude: Number(pickupLng),
            }}
            radius={pulseRadius}
            strokeColor={COLORS.primary}
            strokeWidth={1}
            fillColor="transparent"
          />
          <Marker
            coordinate={{
              latitude: Number(pickupLat),
              longitude: Number(pickupLng),
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: COLORS.primary,
                borderWidth: 2,
                borderColor: COLORS.white,
              }}
            />
          </Marker>

          {offers.map((driver) => (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: driver.latitude,
                longitude: driver.longitude,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <VehicleIcon type={driver.vehicle.type} size={26} />
                <View
                  style={{
                    marginTop: 2,
                    backgroundColor: COLORS.white,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                    borderRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 10 }}>₨{driver.price}</Text>
                </View>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      <View style={styles.bottomSheet}>
        {isSearching ? (
          <Text style={styles.searchingText}>
            Searching for nearby drivers...
          </Text>
        ) : offers.length === 0 ? (
          <Text style={styles.searchingText}>
            No drivers online nearby right now.{"\n"}Please try again in a
            moment.
          </Text>
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <OfferCard item={item} onPressBook={() => handleBook(item)} />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapContainer: { height: 380 },
  map: { flex: 1 },
  bottomSheet: {
    backgroundColor: COLORS.white,
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
    marginTop: -20,
  },
  searchingText: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.gray,
    paddingVertical: 30,
    lineHeight: 24,
  },
});
