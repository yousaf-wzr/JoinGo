import COLORS from "@/constants/color";
import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  children?: React.ReactNode; // ← NEW: allows icons or any element inside button
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
  children, // ← NEW
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {/* If children (like an icon) is passed, show it next to the label */}
      {children ? (
        <View style={styles.row}>
          {children}
          <Text style={[styles.text, textStyle]}>{label}</Text>
        </View>
      ) : (
        <Text style={[styles.text, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: "center",
  },
  row: {
    flexDirection: "row", // icon and text side by side
    alignItems: "center",
    gap: 10, // space between icon and text
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    backgroundColor: COLORS.gray, // ← FIXED: was still primary color when disabled
  },
});

export default Button;
