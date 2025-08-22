import COLORS from "@/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function DriverLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "driverHome") iconName = "car";
          else if (route.name === "driverChat") iconName = "chatbubble";
          else if (route.name === "driverProfile") iconName = "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="driverHome"
        options={{
          title: "Dashboard",
        }}
      />

      <Tabs.Screen
        name="driverProfile"
        options={{
          title: "Profile",
        }}
      /> 
      <Tabs.Screen
        name="chat"
      options={{
          href: null, // Hide from tab bar
        }}
      />   <Tabs.Screen
        name="requirements"
      options={{
          href: null, // Hide from tab bar
        }}
      /> <Tabs.Screen
        name="driverBooking"
      options={{
          href: null, // Hide from tab bar
        }}
      /><Tabs.Screen
        name="driverRequests"
      options={{
          href: null, // Hide from tab bar
        }}
      /><Tabs.Screen
        name="driverProfileInfo"
      options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
