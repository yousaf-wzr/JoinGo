import RideCard from "@/components/ride-card";
import { supabase } from "@/config/supabaseConfig"; // ← NEW: so we can talk to database
import COLORS from "@/constants/color";
import React, { useEffect, useState } from "react"; // ← NEW: useEffect & useState added
import { FlatList, SafeAreaView, StyleSheet, Text } from "react-native";

const Rides = () => {
  // Instead of a fixed list, we start with an empty array
  // and fill it later from the database
  const [rides, setRides] = useState([]);

  // useEffect runs once when the screen opens
  useEffect(() => {
    const fetchRides = async () => {
      // Step 1: Who is logged in right now?
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return; // not logged in? stop here

      // Step 2: Go to the "bookings" table and get rides for THIS user only
      const { data } = await supabase
        .from("bookings")
        .select("*") // get all columns
        .eq("customer_id", user.id) // only this user's rides
        .order("created_at", { ascending: false }); // newest ride first

      // Step 3: Save the rides into our state so the screen re-renders
      if (data) setRides(data);
    };

    fetchRides();
  }, []); // [] = run only once when screen loads

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
