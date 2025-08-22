import FONTS from "@/constants/fonts";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title: string;
  onRightPress?: () => void;
  rightIconElement?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onRightPress, rightIconElement }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.left}>
        <AntDesign name="left" size={18} color="#101010" />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        onPress={onRightPress}
        style={styles.right}
        disabled={!onRightPress}
      >
        {rightIconElement ? <Text>{rightIconElement}</Text> : <View style={{ width: 24 }} />}
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  left: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 100,
  },
  title: {
    fontSize: FONTS.size.large,
    fontFamily: FONTS.medium,
  },
  right: {
    width: 40,
    alignItems: "flex-end",
  },
});
