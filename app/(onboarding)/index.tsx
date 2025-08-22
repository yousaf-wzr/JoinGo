
import COLORS from "@/constants/color";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import CustomButton from "../../components/button"; // ✅ Ensure correct path

export const onboarding = [
  {
    id: 1,
    image: require("../../assets/images/onboarding1.png"),
    title: "The perfect ride is just a tap away!",
    description:
      "Your journey begins with JoinGo. Find your ideal ride effortlessly ",
  },
  {
    id: 2,
    image: require("../../assets/images/onboarding2.png"),
    title: "Best car in your hands with JoinGo",
    description: "Discover the convenience of finding your perfect ride with JoinGo",
  },
  {
    id: 3,
    image: require("../../assets/images/onboarding3.png"),
    title: "Your ride, your way. Let's go!",
    description: "Enter your destination, site back, and let us take care of the reset.",
  },
];
const Onboarding = () => {

  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity
        onPress={() => router.replace("(role)")}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      {/* Swiper Slides */}
      <Swiper
        ref={swiperRef}
        loop={false}
        onIndexChanged={(index) => setActiveIndex(index)}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
      >
        {onboarding.map((item) => (
          <View key={item.id} style={styles.slide}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.title}</Text>
               <Text style={styles.description}>{item.description}</Text>
            </View>
           
          </View>
        ))}
      </Swiper>
      {/* Button */}
     <View style={styles.buttonContainer}>
          <CustomButton
        label={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("(role)")
            : swiperRef.current?.scrollBy(1)
        }
        style={styles.button}
      />
     </View>
    
    </SafeAreaView>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",

  },
  skipButton: {
    width: "100%",
    alignItems: "flex-end",
    padding: 20,
  },
  skipText: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "bold",
  },
  dot: {
    width: 10,
    height: 10,
   marginHorizontal: 3,
    backgroundColor: COLORS.gray,
    borderRadius: 5,
  },
  activeDot: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
     marginHorizontal: 3,
  },
  slide: {
    flex: 1,
    alignItems: "center",
   gap: 50
    
   
  },
  image: {
   
    height: 300,
  },
  titleContainer: {
    
  gap: 20,
    width: "80%",
    
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.black,
  },
  description: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: "center",
    fontWeight: "500",
  },
  buttonContainer:{
      width: "100%",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "92%",
  
    
  
    
  },
});
