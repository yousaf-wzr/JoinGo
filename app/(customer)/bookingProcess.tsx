// app/(customer)/bookingProcess.tsx
import OfferCard, { VehicleIcon } from "@/components/offerCard";
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import { useLocalSearchParams, useRouter } from "expo-router";
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

// Haversine distance in km between 2 coordinates
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
  const {
    pickupLat,
    pickupLng,
    price,
    distanceKm: tripDistance,
    vehicleType,
    pickup,
    dropoff,
  } = useLocalSearchParams();

  const [offers, setOffers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const pickupPulse = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [pulseRadius, setPulseRadius] = useState(50);

  // Pulse animation
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

  // ← CHANGED: Find REAL nearby online drivers within 5km instead of generating fake ones
  useEffect(() => {
    const findNearbyDrivers = async () => {
      // Step 1: Get all drivers who are currently online
      const { data: onlineDrivers } = await supabase
        .from("driver_locations")
        .select("driver_id, latitude, longitude");

      if (!onlineDrivers || onlineDrivers.length === 0) {
        setOffers([]);
        setIsSearching(false);
        return;
      }

      // Step 2: Filter to only drivers within 5km radius
      const nearby = onlineDrivers.filter((d) => {
        const dist = distanceKm(
          Number(pickupLat),
          Number(pickupLng),
          d.latitude,
          d.longitude,
        );
        return dist <= 5; // 5km radius
      });

      if (nearby.length === 0) {
        setOffers([]);
        setIsSearching(false);
        return;
      }

      // Step 3: Get each nearby driver's profile info (name, vehicle, etc)
      const driverIds = nearby.map((d) => d.driver_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, car_model, vehicle_type, license_number")
        .in("id", driverIds);

      // Step 4: Combine location + profile data into one offer object per driver
      const realOffers = nearby.map((loc) => {
        const profile = profiles?.find((p) => p.id === loc.driver_id);
        const dist = distanceKm(
          Number(pickupLat),
          Number(pickupLng),
          loc.latitude,
          loc.longitude,
        );

        return {
          id: loc.driver_id,
          driverId: loc.driver_id,
          driverName: profile?.full_name || "Driver",
          image: `https://www.gravatar.com/avatar/${loc.driver_id}?d=mp&s=100`,
          rating: "4.8", // placeholder until rating system exists
          price: Number(price), // same price for all real drivers (can negotiate after)
          eta: Math.max(1, Math.round((dist / 30) * 60)), // estimate based on 30km/h avg speed
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

      // Fit map to show pickup + all driver markers
      if (mapRef.current) {
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

  // Save booking to Supabase when customer books a driver
  const handleBook = async (item: any) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newBooking } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        driver_id: item.driverId, // ← NEW: assign the specific driver
        pickup: pickup,
        dropoff: dropoff,
        price: item.price,
        vehicle_type: item.vehicle.type,
        status: "pending",
      })
      .select()
      .single();

    if (newBooking) {
      setBookingId(newBooking.id);
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
    <SafeAreaView style={styles.container}>
      <View style={{ height: 500 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
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

          {/* Real driver markers */}
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
