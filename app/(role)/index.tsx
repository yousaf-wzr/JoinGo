import Button from "@/components/button";
import FONTS from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
export default function RoleScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/role.jpg")} // ← FIXED: require() inside component
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Choose Your Role</Text>

        {/* ← Both buttons now go to signup with their role */}
        {/* Signup will handle where to go AFTER — customer goes home, driver goes to requirements */}
        <Button
          label="Passenger"
          style={styles.button}
          onPress={
            () =>
              router.push({
                pathname: "/(auth)/signup",
                params: { role: "customer" },
              }) // ← FIXED: was "passenger", now "customer" to match our DB
          }
        >
          <Ionicons name="person-outline" size={28} color="white" />
        </Button>

        <Button
          label="Driver"
          style={styles.button}
          onPress={
            () =>
              router.push({
                pathname: "/(auth)/signup",
                params: { role: "driver" },
              }) // ← FIXED: now goes to signup first, not requirements
          }
        >
          <Ionicons name="car-outline" size={28} color="white" />
        </Button>

        {/* Already have an account? */}
        <Text
          style={styles.loginText}
          onPress={() => router.push("/(auth)/login")}
        >
          Already have an account? <Text style={styles.loginLink}>Sign In</Text>
        </Text>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: FONTS.size.title,
    fontFamily: FONTS.medium,
    textAlign: "center",
    color: "#fff",
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 50,
    marginVertical: 8,
    width: "90%",
    justifyContent: "center",
  },
  loginText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  loginLink: {
    fontFamily: FONTS.medium,
    textDecorationLine: "underline",
  },
});
