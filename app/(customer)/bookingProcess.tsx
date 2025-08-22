import OfferCard, { VehicleIcon } from "@/components/offerCard";
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
  const { pickupLat, pickupLng, price, distanceKm, vehicleType } =
    useLocalSearchParams();

  const [offers, setOffers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  const pickupPulse = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  const [pulseRadius, setPulseRadius] = useState(50); // initial radius in meters

  // Start pulse animation
  useEffect(() => {
    const loop = () => {
      Animated.sequence([
        Animated.timing(pickupPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, // must be false for Circle
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

  // Update state from Animated.Value
  useEffect(() => {
    const listenerId = pickupPulse.addListener(({ value }) => {
      // Map value [0,1] to radius [50, 200] meters
      setPulseRadius(50 + value * 150);
    });
    return () => {
      pickupPulse.removeListener(listenerId);
    };
  }, []);

  // Generate driver offers
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
          }
        );
      }
    }, 2000);
  }, []);

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
          {/* Pickup pulse circle */}
          <Circle
            center={{
              latitude: Number(pickupLat),
              longitude: Number(pickupLng),
            }}
            radius={pulseRadius} // radius animates
            strokeColor={COLORS.primary} // line color
            strokeWidth={1} // line thickness
            fillColor="transparent" // makes it only a ring
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

          {/* Driver markers */}
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

      {/* Bottom sheet */}
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
                onPressBook={() =>
                  router.push({
                    pathname: "/booking",
                    params: { booking: JSON.stringify(item) },
                  })
                }
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
