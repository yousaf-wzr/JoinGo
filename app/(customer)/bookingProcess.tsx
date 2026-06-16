import OfferCard, { VehicleIcon } from "@/components/offerCard";
import { supabase } from "@/config/supabaseConfig"; // ← NEW: to save booking to DB
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

export default function OffersScreen() {
  const router = useRouter();

  // ← NEW: also grab pickup & dropoff address text from params
  const {
    pickupLat,
    pickupLng,
    price,
    distanceKm,
    vehicleType,
    pickup,
    dropoff,
  } = useLocalSearchParams();

  const [offers, setOffers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  const pickupPulse = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const [pulseRadius, setPulseRadius] = useState(50);

  // Pulse animation — makes the circle on the map grow and shrink
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
    const listenerId = pickupPulse.addListener(({ value }) => {
      setPulseRadius(50 + value * 150);
    });
    return () => {
      pickupPulse.removeListener(listenerId);
    };
  }, []);

  // Generate fake driver offers (still fake for now — real drivers come later)
  useEffect(() => {
    const generateOffers = () =>
      Array.from({ length: 5 }).map((_, i) => {
        const latOffset = (Math.random() - 0.5) * 0.01;
        const lngOffset = (Math.random() - 0.5) * 0.01;

        const vehicleOptions = [
          { type: "Motorcycle", color: "Red", plate: "ABC-123" },
          { type: "Car", color: "White", plate: "XYZ-456" },
          { type: "Van", color: "Black", plate: "JKL-789" },
          { type: "Car", color: "Blue", plate: "LMN-321" },
        ];

        const selectedVehicle =
          vehicleOptions.find((v) => v.type === vehicleType) ||
          vehicleOptions[0];

        const variation = Math.random() * 0.2 - 0.1;
        const driverPrice = Math.round(Number(price) * (1 + variation));

        const distanceVariation = Math.random() * 0.1 - 0.05;
        const driverDistance = (
          Number(distanceKm) *
          (1 + distanceVariation)
        ).toFixed(1);

        return {
          id: i + 1,
          driverName: `Driver ${i + 1}`,
          image: `https://randomuser.me/api/portraits/men/${i + 10}.jpg`,
          rating: (Math.random() * 2 + 3).toFixed(1),
          price: driverPrice,
          eta: Math.floor(Math.random() * 10) + 3,
          distance: driverDistance,
          latitude: Number(pickupLat) + latOffset,
          longitude: Number(pickupLng) + lngOffset,
          vehicle: selectedVehicle,
        };
      });

    setTimeout(() => {
      const data = generateOffers();
      setOffers(data);
      setIsSearching(false);

      if (mapRef.current) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: Number(pickupLat), longitude: Number(pickupLng) },
            ...data.map((o) => ({
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
    }, 2000);
  }, []);

  // ← NEW: this runs when customer taps "Book" on a driver offer
  const handleBook = async (item: any) => {
    // Step 1: Find out who is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Step 2: Save the booking to our "bookings" table in Supabase
    // Think of this like filling out a form and submitting it to a database
    await supabase.from("bookings").insert({
      customer_id: user.id, // who is booking
      pickup: pickup, // where to pick them up (address text)
      dropoff: dropoff, // where to drop them off (address text)
      price: item.price, // price the driver offered
      vehicle_type: item.vehicle.type, // Car / Motorcycle / Van
      status: "pending", // waiting for driver to accept
    });

    // Step 3: Go to the booking screen as before
    router.push({
      pathname: "/booking",
      params: { booking: JSON.stringify(item) },
    });
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
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
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
                    shadowColor: "#000",
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
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
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <OfferCard
                item={item}
                onPressBook={() => handleBook(item)} // ← now calls handleBook instead
              />
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
    paddingVertical: 20,
  },
});
