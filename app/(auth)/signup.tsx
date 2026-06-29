import Button from "@/components/button";
import OrDivider from "@/components/divider";
import InputField from "@/components/text-Input";
import { supabase } from "@/config/supabaseConfig";
import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const Signup = () => {
  const { role } = useLocalSearchParams();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = () => {
    router.push({ pathname: "/(auth)/login", params: { role } });
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      // Create the account in Supabase Auth (handles email + password)
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        Alert.alert("Signup Failed", error.message);
        return;
      }

      // Auth only stores email/password. We also need a row in "profiles"
      // for the name, role, and approval status (drivers start "pending",
      // customers start "approved" immediately).
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          role: role,
          status: role === "driver" ? "pending" : "approved",
        });

        if (profileError) {
          console.log("Profile insert error:", profileError.message);
          Alert.alert(
            "Error",
            "Account created but profile setup failed: " + profileError.message,
          );
          return;
        }
      } else {
        // If email confirmation is enabled in Supabase, data.user is null
        // until the user confirms their email — send them to login instead.
        Alert.alert(
          "Check Your Email",
          "We sent a confirmation link to your email. Please confirm it then log in.",
        );
        router.replace("/(auth)/login");
        return;
      }

      // Route to the right screen based on the role chosen earlier
      if (role === "driver") {
        router.replace("/(driver)/requirements");
      } else if (role === "customer" || role === "passenger") {
        router.replace("/(customer)");
      } else {
        Alert.alert("Error", "Invalid role. Please select driver or customer.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Top image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/signup-car.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Heading */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>Create Your Account</Text>
      </View>

      {/* Form */}
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <InputField
            label="Full Name"
            placeholder="Full Name"
            icon="user"
            value={fullName}
            onChangeText={setFullName}
          />
          <InputField
            label="Email"
            placeholder="Email"
            icon="mail"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            label="Password"
            placeholder="Password"
            icon="lock"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          <Button
            label={loading ? "Signing up..." : "Sign up"}
            onPress={handleSignup}
            style={{ marginTop: 25 }}
            disabled={loading}
          />

          <OrDivider />
        </View>

        {/* Footer */}
        <View style={styles.footerButtonContainer}>
          <Text style={styles.footerButtonText}>
            Already have an account?{" "}
            <TouchableOpacity onPress={handleSignin}>
              <Text style={{ color: COLORS.primary }}>Sign In</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;

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
  inputContainer: { paddingHorizontal: 15, gap: 15, marginTop: 10 },
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
