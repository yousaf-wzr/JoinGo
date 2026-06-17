// components/ChatScreen.tsx
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
    const setup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
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

      if (booking) {
        setBookingId(booking.id);
        fetchMessages(booking.id);
        subscribeToMessages(booking.id);
      }
    };

    setup();
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
    supabase
      .channel("messages")
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

  // ← FIXED: was ({ item }: { item: any }) {{ — double brace was a syntax error
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
