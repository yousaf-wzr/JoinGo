import Button from "@/components/button";
import FONTS from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import RoleImage from "../../assets/images/role.jpg";

export default function RoleScreen() {
  const router = useRouter();

  return (
    <ImageBackground source={RoleImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Choose Your Role</Text>

        <Button
          label="Passenger"
          style={styles.button}
          onPress={() => router.push({ pathname: "/(auth)/signup", params: { role: "passenger" } })}
        >
          <Ionicons name="person-outline" size={28} color="white" />
        </Button>

        <Button
          label="Driver"
          style={styles.button}
          onPress={() => router.push({ pathname: "/(driver)/requirements", params: { role: "driver" } })}
        >
          <Ionicons name="car-outline" size={28} color="white" />
        </Button>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  safeArea: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: FONTS.size.title, fontFamily: FONTS.medium, textAlign: "center", color: "#fff", marginBottom: 30 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 50,
    marginVertical: 8,
    width: "90%",
    justifyContent: "center"
  }
});
