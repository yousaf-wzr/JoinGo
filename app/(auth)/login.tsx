import Button from "@/components/button";
import OrDivider from "@/components/divider";
import InputField from "@/components/text-Input";
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Login Failed", error.message);
        return;
      }

      // Role is always read fresh from the profiles table after login,
      // rather than trusted from navigation params, since those can be
      // missing or stale.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "driver") {
        if (profile.status === "pending") {
          Alert.alert(
            "Pending Approval",
            "Your driver account is still under review. Please wait for approval.",
          );
          await supabase.auth.signOut();
          return;
        }
        router.replace("/(driver)/driverHome");
      } else {
        router.replace("/(customer)");
      }
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.text}>Welcome Back</Text>
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
            onPress={handleLogin}
            disabled={loading}
            style={{ marginTop: 25 }}
          />
          <OrDivider />
        </View>

        {/* Footer */}
        <View style={styles.footerButtonContainer}>
          <Text style={styles.footerButtonText}>
            Don't have an account?{" "}
            <TouchableOpacity onPress={() => router.push("/(role)")}>
              <Text style={{ color: COLORS.primary }}>Sign Up</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  imageContainer: {
    position: "absolute",
    width: "100%",
    height: 250,
    top: 0,
    left: 0,
    zIndex: 1,
  },
  image: { width: "100%", height: "100%" },
  textContainer: { width: "100%", zIndex: 2, marginLeft: 10, marginTop: 200 },
  inputContainer: { paddingHorizontal: 15, gap: 20, marginTop: 10 },
  text: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.large,
    color: COLORS.black,
  },
  footerButtonContainer: { marginTop: 20, alignItems: "center" },
  footerButtonText: {
    fontFamily: FONTS.regular,
    fontSize: FONTS.size.medium,
    color: COLORS.black,
  },
});
