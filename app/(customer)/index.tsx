import InputField from "@/components/text-Input";
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import {
  faArrowRightFromBracket,
  faCarSide,
  faLocationDot,
  faMotorcycle,
  faTruckPickup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

// Haversine distance calculation
const haversineDistance = (coords1: any, coords2: any) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [address, setAddress] = useState<string>("Fetching location...");
  const [username, setUsername] = useState("there"); // "there" is fallback → "Welcome, there"

  // Fetch the real logged-in user's name from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      // 1. Ask Supabase "who is currently logged in?"
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return; // not logged in, do nothing

      // 2. Use their ID to get their name from our profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id) // find the row where id matches logged-in user
        .single(); // we expect only one result

      if (profile) setUsername(profile.full_name);
    };
    fetchUser();
  }, []); // [] means run once when the screen loads

  const [pickup, setPickup] = useState("");
  const [isPickupEdited, setIsPickupEdited] = useState(false);
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<any>(null);
  const [dropoffCoords, setDropoffCoords] = useState<any>(null);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [vehicleType, setVehicleType] = useState<"Car" | "Motorcycle" | "Van">(
    "Car",
  );
  const [price, setPrice] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [nearbyVehicles, setNearbyVehicles] = useState<any[]>([]);
  const router = useRouter();
  const priceRates = { Car: 120, Motorcycle: 80, Van: 150 }; // PKR per km

  // Live location tracking
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setAddress("Permission to access location was denied");
        return;
      }

      // Watch live location
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        async (loc) => {
          setLocation(loc);
          setPickupCoords(loc.coords);

          // Reverse geocode
          const geo = await Location.reverseGeocodeAsync(loc.coords);
          if (geo.length > 0) {
            const { city, region, country } = geo[0];
            const fullAddress = `${city}, ${region}, ${country}`;
            setAddress(fullAddress);
            if (!isPickupEdited) {
              setPickup(fullAddress);
            }
          }

          // Generate random nearby vehicles
          const randomVehicles = Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            latitude: loc.coords.latitude + (Math.random() - 0.5) * 0.02,
            longitude: loc.coords.longitude + (Math.random() - 0.5) * 0.02,
          }));
          setNearbyVehicles(randomVehicles);
        },
      );
    })();
  }, []);

  // Convert address to coordinates
  // Converts a typed address into map coordinates using the device's geocoder.
  // Returns null if the address can't be resolved (e.g. too vague or misspelled).
  const fetchCoords = async (address: string) => {
    try {
      const results = await Location.geocodeAsync(address);
      if (results.length > 0) return results[0];
    } catch {
      // Geocoding failed — caller will show an appropriate message
    }
    return null;
  };

  // Update polyline & price when drop-off or vehicle type changes
  useEffect(() => {
    (async () => {
      if (pickupCoords && dropoff) {
        const dropoffC = await fetchCoords(dropoff);

        if (dropoffC) {
          setDropoffCoords(dropoffC);

          // Calculate distance in km
          const distance = haversineDistance(pickupCoords, dropoffC);
          setDistanceKm(distance);

          // Calculate price based on vehicle type
          const calculatedPrice = Math.round(
            distance * priceRates[vehicleType],
          );
          setPrice(calculatedPrice);

          // Draw straight polyline
          setRouteCoords([pickupCoords, dropoffC]);
        }
      }
    })();
  }, [pickupCoords, dropoff, vehicleType]);

  const handleLogout = () => {
    router.replace("/login");
  };

  const handleBooking = () => {
    if (!pickup || !dropoff) {
      alert("Please fill in both pickup and drop-off!");
      return;
    }
    if (!pickupCoords) {
      alert(
        "Still getting your current location. Please wait a moment and try again.",
      );
      return;
    }
    if (!dropoffCoords) {
      alert(
        "Couldn't find that drop-off location on the map. Try a more specific address (e.g. add city name).",
      );
      return;
    }
    // Navigate to the driver search screen with both coordinates
    // (for distance/map use) and readable address text (for display + storage)
    router.push({
      pathname: "/bookingProcess",
      params: {
        pickupLat: pickupCoords.latitude,
        pickupLng: pickupCoords.longitude,
        dropoffLat: dropoffCoords.latitude,
        dropoffLng: dropoffCoords.longitude,
        price: price || 0,
        distanceKm: distanceKm || 0,
        vehicleType,
        pickup,
        dropoff,
      },
    });
  };

  const getVehicleIcon = () => {
    if (vehicleType === "Motorcycle") return faMotorcycle;
    if (vehicleType === "Van") return faTruckPickup;
    return faCarSide;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome, {username}</Text>
        <TouchableOpacity style={styles.logoutContainer} onPress={handleLogout}>
          <FontAwesomeIcon
            icon={faArrowRightFromBracket}
            size={16}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {pickupCoords && (
              <Marker coordinate={pickupCoords} title="Pickup">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  size={30}
                  color={COLORS.primary}
                />
              </Marker>
            )}
            {dropoffCoords && (
              <Marker coordinate={dropoffCoords} title="Drop-off">
                <FontAwesomeIcon icon={faLocationDot} size={30} color="red" />
              </Marker>
            )}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor={COLORS.primary}
                strokeWidth={4}
              />
            )}
            {nearbyVehicles.map((v) => (
              <Marker
                key={v.id}
                coordinate={{ latitude: v.latitude, longitude: v.longitude }}
                title="Nearby Vehicle"
              >
                <FontAwesomeIcon
                  icon={getVehicleIcon()}
                  size={28}
                  color={COLORS.primary}
                />
              </Marker>
            ))}
          </MapView>
        )}
      </View>

      <Text style={styles.locationTitle}>Your Current Location</Text>

      {/* Pickup */}
      <InputField
        icon="map-pin"
        value={pickup}
        onChangeText={(text) => {
          setPickup(text);
          setIsPickupEdited(true);
        }}
      />

      {/* Dropoff */}
      <InputField
        placeholder="Drop-off Location"
        icon="map-pin"
        value={dropoff}
        onChangeText={setDropoff}
        wrapperStyle={{ marginTop: 10 }}
      />

      {/* Vehicle selection */}
      <Text style={styles.paymentLabel}>Vehicle Type</Text>
      <View style={styles.paymentOptions}>
        {(["Car", "Motorcycle", "Van"] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.paymentButton,
              vehicleType === type && styles.paymentSelected,
            ]}
            onPress={() => setVehicleType(type)}
          >
            <Text
              style={[
                styles.paymentText,
                vehicleType === type && { color: "white" },
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payment selection */}
      <Text style={styles.paymentLabel}>Payment Method</Text>
      <View style={styles.paymentOptions}>
        {["Cash", "Card"].map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.paymentButton,
              paymentMethod === method && styles.paymentSelected,
            ]}
            onPress={() => setPaymentMethod(method)}
          >
            <Text
              style={[
                styles.paymentText,
                paymentMethod === method && { color: "white" },
              ]}
            >
              {method}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {price !== null && (
        <>
          <Text style={styles.priceText}>Estimated Price: PKR {price}</Text>
          {distanceKm !== null && (
            <Text style={styles.distanceText}>
              Distance: {distanceKm.toFixed(2)} km
            </Text>
          )}
        </>
      )}

      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  welcome: { fontSize: FONTS.size.large, fontWeight: "600" },
  logoutContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  mapContainer: {
    marginTop: 10,
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  locationTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONTS.size.medium,
    marginTop: 8,
  },
  paymentLabel: {
    marginTop: 15,
    fontSize: FONTS.size.medium,
    fontWeight: "600",
  },
  paymentOptions: {
    flexDirection: "row",
    marginTop: 6,
    gap: 8,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  paymentSelected: {
    backgroundColor: COLORS.primary,
  },
  paymentText: {
    color: COLORS.black,
  },
  priceText: {
    marginTop: 8,
    fontSize: FONTS.size.medium,
    fontWeight: "bold",
  },
  distanceText: {
    marginTop: 2,
    fontSize: 14,
    color: COLORS.gray,
  },
  bookButton: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: FONTS.size.medium,
    fontWeight: "600",
  },
});
