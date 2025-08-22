import Button from "@/components/button";
import OrDivider from "@/components/divider";
import InputField from "@/components/text-Input";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Signup = () => {
  const router = useRouter();
  const { role } = useLocalSearchParams(); // Get role from previous screen

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = () => {
    // Pass role again when navigating to signup
    router.push({ pathname: "/(auth)/signup", params: { role } });
  };

  const handleSignup = async () => {
    setLoading(true);

    // Save role in AsyncStorage
    await AsyncStorage.setItem("userRole", role || "");

    // Navigate based on role
    if (role === "driver") {
      router.replace("/(driver)/requirements");
    } else {
      router.replace("/(customer)");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Top Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/signup-car.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Title */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>Welcome {role ? role.toUpperCase() : ""}</Text>
      </View>

      {/* Input Fields */}
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <InputField
            label="Email"
            placeholder="Email"
            keyboardType="email-address"
            icon="mail"
            value={email}
            onChangeText={setEmail}
          />

          <InputField
            label="Password"
            placeholder="Password"
            isPassword
            icon="lock"
            value={password}
            onChangeText={setPassword}
          />

          <Button
            label={loading ? "Signing In..." : "Sign In"}
            onPress={handleSignup}
            disabled={loading}
            style={{ marginTop: 25 }}
          />

          <OrDivider />
        </View>

        {/* Footer */}
        <View style={styles.footerButtonContainer}>
          <Text style={styles.footerButtonText}>
            Don't have an account?{" "}
            <TouchableOpacity onPress={handleSignin}>
              <Text style={{ color: COLORS.primary }}>Sign Up</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  imageContainer: {
    position: "absolute",
    width: "100%",
    height: 250,
    top: 0,
    left: 0,
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: "100%",
    zIndex: 2,
    marginLeft: 10,
    marginTop: 200,
  },
  inputContainer: {
    paddingHorizontal: 15,
    gap: 20,
    marginTop: 10,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.large,
    color: COLORS.black,
  },
  footerButtonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.medium,
    color: COLORS.black,
  },
});
