import RideCard from "@/components/ride-card";
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text } from "react-native";

const Rides = () => {
  const [rides, setRides] = useState<any[]>([]);

  const fetchRides = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setRides(data);
  }, []);

  // Refetches every time this screen comes into focus (not just on first
  // mount), so a ride booked moments ago shows up immediately on this tab.
  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [fetchRides]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideCard
            from={item.pickup} // database column is "pickup" not "from"
            to={item.dropoff} // database column is "dropoff" not "to"
            dateTime={item.created_at}
            driver={"Assigned Driver"}
            carSeats={4}
            paymentStatus={"Paid"}
            mapUrl={""}
          />
        )}
        // Show a message when there are no rides yet
        ListEmptyComponent={<Text style={styles.emptyText}>No rides yet.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Rides;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: COLORS.gray,
    fontSize: 15,
  },
});
