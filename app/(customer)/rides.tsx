import RideCard from "@/components/ride-card";
import COLORS from "@/constants/color";
import React from "react";
import { FlatList, SafeAreaView, StyleSheet, Text } from "react-native";


const rides = () => {
  const rides = [
    {
      id: "1",
      from: "Mingora",
      to: "Malamjaba",
      dateTime: "12 Aug 2024, 05:19 AM",
      driver: "Ibrahim Khalid",
      carSeats: 5,
      paymentStatus: "Paid" as const,
      mapUrl: `https://staticmap.openstreetmap.de/staticmap.php?center=35.2163,72.4258&zoom=13&size=600x300&markers=35.2163,72.4258,red`,
    },
    {
      id: "2",
      from: "Mingora",
      to: "Malamjaba",
      dateTime: "12 Aug 2024, 05:19 AM",
      driver: "Ibrahim Khalid",
      carSeats: 5,
      paymentStatus: "Paid" as const,
      mapUrl: `https://staticmap.openstreetmap.de/staticmap.php?center=35.2163,72.4258&zoom=13&size=600x300&markers=35.2163,72.4258,red`,
    },
    {
      id: "3",
      from: "Mingora",
      to: "Malamjaba",
      dateTime: "12 Aug 2024, 05:19 AM",
      driver: "Ibrahim Khalid",
      carSeats: 5,
      paymentStatus: "Paid" as const,
      mapUrl: `https://staticmap.openstreetmap.de/staticmap.php?center=35.2163,72.4258&zoom=13&size=600x300&markers=35.2163,72.4258,red`,
    },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideCard
            from={item.from}
            to={item.to}
            dateTime={item.dateTime}
            driver={item.driver}
            carSeats={item.carSeats}
            paymentStatus={item.paymentStatus}
            mapUrl={item.mapUrl}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default rides;

const styles = StyleSheet.create({
  container:{
     flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
    sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },

});
