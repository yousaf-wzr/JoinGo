import COLORS from "@/constants/color";
import FONTS from "@/constants/fonts";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OrDivider() {
  return (
    <View>
      <View style={styles.container}>
        <View style={styles.line} />
        <Text style={styles.text}>Or sign in with</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.socialIcons}>
        <TouchableOpacity style={styles.IconContainer}>
          <Image
            source={require("../assets/images/Google.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
         <TouchableOpacity style={styles.IconContainer}>
          <Image
            source={require("../assets/images/Facebook.png")}
            style={styles.icon}
          />
        </TouchableOpacity> 
        <TouchableOpacity style={styles.IconContainer}>
          <Image
            source={require("../assets/images/Apple.png")}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "gray",
    opacity: 0.4,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.small,
    marginHorizontal: 10,
    color: "gray",
  },
  IconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 40,
    borderColor: COLORS.gray,
    
  },
  socialIcons:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    gap: 15
  },
  icon:{
    width: 30,
    height: 30,
    resizeMode: "contain",

  }
});
