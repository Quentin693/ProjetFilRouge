import { Tabs } from "expo-router";
import { Colors } from "@/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

function TabIcon({ name, color }: { name: IconName; color: unknown }) {
  return <MaterialIcons name={name} size={24} color={(color as string) ?? "#888"} />;
}

export default function AdminTabsLayout() {
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
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Vue",
          tabBarIcon: ({ color }) => <TabIcon name="dashboard" color={color} />,
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
        name="destinations"
        options={{
          title: "Destinations",
          tabBarIcon: ({ color }) => <TabIcon name="place" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: "Réservations",
          tabBarIcon: ({ color }) => <TabIcon name="event-note" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Plus",
          tabBarIcon: ({ color }) => <TabIcon name="more-horiz" color={color} />,
        }}
      />
    </Tabs>
  );
}
