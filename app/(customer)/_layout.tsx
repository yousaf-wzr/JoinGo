import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff", // keep tab bar normal
          height: 60,
        },
        tabBarActiveTintColor: "#fff", // icon color when active
        tabBarInactiveTintColor: "#94A3B8", // icon color when inactive
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#FF0048" : "transparent", //
                // padding: 6,
                borderRadius: 60,
                width: 60,
                height: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome name="home" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#FF0048" : "transparent",
                borderRadius: 60,
                width: 60,
                height: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome name="car" size={20} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? "#FF0048" : "transparent",
                borderRadius: 60,
                width: 60,
                height: 60,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FontAwesome name="user" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        // name="Profile Info"
        name="profileInfo"
        options={{
          href: null, // Hide from tab bar
        }}
      />   <Tabs.Screen
        // name="Profile Info"
        name="chat"
        options={{
          href: null, // Hide from tab bar
        }}
      />
   <Tabs.Screen
        // name="Profile Info"
        name="booking"
        options={{
          href: null, // Hide from tab bar
        }}
      />
   

     <Tabs.Screen
        // name="Profile Info"
        name="bookingProcess"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
