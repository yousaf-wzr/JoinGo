import COLORS from "@/constants/color";
import { faCarSide, faMotorcycle, faTruckPickup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Vehicle Icon Component
export const VehicleIcon = ({ type, size = 24 }: { type: string; size?: number }) => {
  switch (type) {
    case "Motorcycle":
      return <FontAwesomeIcon icon={faMotorcycle} size={size} color={COLORS.primary} />;
    case "Van":
      return <FontAwesomeIcon icon={faTruckPickup} size={size} color={COLORS.primary} />;
    default:
      return <FontAwesomeIcon icon={faCarSide} size={size} color={COLORS.primary} />;
  }
};

// Offer Card Component
export default function OfferCard({ item }: { item: any }) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      {/* Driver Image → Profile */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/driverProfile",
            params: { driver: JSON.stringify(item) },
          })
        }
      >
        <Image source={{ uri: item.image }} style={styles.image} />
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.driverName}>{item.driverName}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>

        {/* Vehicle Info with Icon */}
        <View style={styles.vehicleContainer}>
          <VehicleIcon type={item.vehicle.type} size={18} />
          <Text style={styles.vehicleText}>
            {item.vehicle.color} {item.vehicle.type} ({item.vehicle.plate})
          </Text>
        </View>

        <Text style={styles.distance}>
          {item.distance} km • ETA: {item.eta} min
        </Text>
        <Text style={styles.price}>₨{item.price}</Text>
      </View>

      {/* Book Button */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          router.push({
            pathname: "/booking",
            params: { booking: JSON.stringify(item) },
          })
        }
      >
        <Text style={styles.bookText}>Book</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  rating: {
    fontSize: 14,
    color: COLORS.gray,
  },
  vehicleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  vehicleText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 5,
  },
  distance: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 5,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bookText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});
