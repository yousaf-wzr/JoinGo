// components/ChatScreen.tsx
import COLORS from "@/constants/color";
import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatScreen({ userRole = "customer" }) {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello, I'm on my way!", sender: "driver" },
    { id: "2", text: "Great, see you soon!", sender: "customer" },
  ]);
  const [input, setInput] = useState("");

  const quickReplies =
    userRole === "driver"
      ? ["I'm here", "On my way", "Please wait", "Traffic ahead", "See you soon"]
      : ["Where are you?", "Thanks", "Please wait", "I’m coming", "See you soon"];

  const sendMessage = (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: msg, sender: userRole },
    ]);
    setInput("");
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === userRole;
    return (
      <View
        style={[
          styles.message,
          isMe ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={{ color: COLORS.white }}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
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
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}>
          <Text style={{ color: COLORS.white }}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: 16, marginTop: 30},
  message: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: "70%",
  },
  myMessage: { backgroundColor: COLORS.primary, alignSelf: "flex-end" },
  otherMessage: { backgroundColor: COLORS.secondary, alignSelf: "flex-start" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: "center",
  },
  input: { flex: 1, padding: 10, backgroundColor: COLORS.white, borderRadius: 8 },
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
