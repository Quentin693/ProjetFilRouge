import { Tabs } from "expo-router";
import { Colors } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

function TabIcon({ name, color }: { name: IconName; color: unknown }) {
  return <MaterialIcons name={name} size={24} color={(color as string) ?? "#888"} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="voyages"
        options={{
          title: "Voyages",
          tabBarIcon: ({ color }) => <TabIcon name="flight" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: "Mes voyages",
          tabBarIcon: ({ color }) => <TabIcon name="luggage" color={color} />,
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: "À proximité",
          tabBarIcon: ({ color }) => <TabIcon name="near-me" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
