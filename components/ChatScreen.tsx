// components/ChatScreen.tsx
//
// Realtime chat between a customer and driver for an active booking.
// Finds the user's current active booking, loads message history,
// and subscribes to new messages so they appear instantly on both ends.

import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatScreen({ userRole = "customer" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const channelRef = useRef<any>(null); // tracks the active realtime channel for cleanup

  const quickReplies =
    userRole === "driver"
      ? [
          "I'm here",
          "On my way",
          "Please wait",
          "Traffic ahead",
          "See you soon",
        ]
      : [
          "Where are you?",
          "Thanks",
          "Please wait",
          "I'm coming",
          "See you soon",
        ];

  useEffect(() => {
    let isMounted = true; // guards against state updates after the screen has closed

    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !isMounted) return;
      setUserId(user.id);

      const column = userRole === "customer" ? "customer_id" : "driver_id";
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq(column, user.id)
        .in("status", ["pending", "accepted"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (booking && isMounted) {
        setBookingId(booking.id);
        fetchMessages(booking.id);
        subscribeToMessages(booking.id);
      }
    };

    setup();

    // Remove the realtime channel when this screen closes, so it doesn't
    // linger and conflict with a new one if the chat is reopened.
    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const fetchMessages = async (bId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("booking_id", bId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  const subscribeToMessages = (bId: string) => {
    // Each booking gets its own channel name. Using one shared name across
    // all chats would cause "cannot add postgres_changes after subscribe()"
    // errors once more than one chat screen is active.
    const channel = supabase
      .channel(`messages-${bId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${bId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        },
      )
      .subscribe();

    channelRef.current = channel;
  };

  const sendMessage = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || !bookingId) return;

    await supabase.from("messages").insert({
      booking_id: bookingId,
      sender_id: userId,
      message: msg,
    });

    setInput("");
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === userId;
    return (
      <View
        style={[styles.message, isMe ? styles.myMessage : styles.otherMessage]}
      >
        <Text style={{ color: COLORS.white }}>{item.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No messages yet. Say hello! 👋</Text>
          }
        />

        <View style={styles.quickRow}>
          {quickReplies.map((q) => (
            <TouchableOpacity
              key={q}
              style={styles.quickBtn}
              onPress={() => sendMessage(q)}
            >
              <Text style={styles.quickText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => sendMessage()}
          >
            <Text style={{ color: COLORS.white, fontWeight: "600" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 30,
  },
  message: { padding: 10, marginVertical: 4, borderRadius: 8, maxWidth: "70%" },
  myMessage: { backgroundColor: COLORS.primary, alignSelf: "flex-end" },
  otherMessage: { backgroundColor: COLORS.secondary, alignSelf: "flex-start" },
  emptyText: { textAlign: "center", color: COLORS.gray, marginTop: 40 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
  },
  quickRow: { flexDirection: "row", marginBottom: 6, flexWrap: "wrap", gap: 8 },
  quickBtn: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickText: { color: COLORS.black, fontWeight: "500" },
});
