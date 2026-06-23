// app/(driver)/driverRequests.tsx
//
// Shows the driver their pending ride requests, updating in real time
// as new bookings come in, and lets them accept a request to start a trip.

import RequestCard from "@/components/RequestCard";
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function DriverRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const fetchRequests = useCallback(async () => {
    if (!userId) return;

    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .eq("driver_id", userId)
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  }, [userId]);

  // Refresh whenever the driver returns to this screen
  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  // Subscribe to new bookings assigned to this driver while the screen is open
  useEffect(() => {
    if (!userId) return;

    fetchRequests();

    const channel = supabase
      .channel(`driver-requests-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `driver_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new.status === "pending") {
            setRequests((prev) => [payload.new, ...prev]);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleAccept = async (item: any) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "accepted" })
      .eq("id", item.id);

    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== item.id));
      router.replace({
        pathname: "/driverBooking",
        params: { booking: JSON.stringify(item) },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ride Requests</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{requests.length}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        {requests.length > 0
          ? "Customers waiting for your response"
          : "You'll see new requests here in real-time"}
      </Text>

      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RequestCard
            item={item}
            onPressOpen={() =>
              router.push({
                pathname: "/driverBooking",
                params: { booking: JSON.stringify(item) },
              })
            }
            onPressAccept={() => handleAccept(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🚗</Text>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptyText}>
              Stay online — new ride requests will appear here automatically.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: COLORS.gray, fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 24, fontFamily: FONTS.bold, color: COLORS.black },
  countBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: 13 },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: 16,
    fontFamily: FONTS.regular,
  },
  emptyState: { alignItems: "center", marginTop: 80, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 17,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 19,
  },
});
