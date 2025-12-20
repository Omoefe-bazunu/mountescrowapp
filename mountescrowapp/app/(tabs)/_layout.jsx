import { Tabs, useRouter } from "expo-router";
import {
  Home,
  LayoutDashboard,
  Info,
  HelpCircle,
  User,
  Bell,
  MessageCircle,
  Headset,
} from "lucide-react-native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";

function TopNavigation() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        {/* Left: Logo and Company Name */}
        <View style={styles.leftSection}>
          <Image
            source={{
              uri: "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FIcon%204.png?alt=media&token=bbb32ee1-d121-4f37-b97a-a3b0d82e5297",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.companyName, { color: colors.primary }]}>
            Mountescrow
          </Text>
        </View>

        {/* Right: Notifications and Contact */}
        <View style={styles.rightSection}>
          {/* Notifications Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(tabs)/about/notifications")}
            activeOpacity={0.7}
          >
            <Bell size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Contact Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(tabs)/about/contact")}
            activeOpacity={0.7}
          >
            <Headset size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <>
      <TopNavigation />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        {/* 🏠 Home Tab */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />

        {/* 📊 Dashboard Tab */}
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ size, color }) => (
              <LayoutDashboard size={size} color={color} />
            ),
          }}
        />

        {/* ℹ️ About Tab */}
        <Tabs.Screen
          name="about"
          options={{
            title: "About",
            tabBarIcon: ({ size, color }) => <Info size={size} color={color} />,
          }}
        />

        {/* ❓ FAQs Tab */}
        <Tabs.Screen
          name="faqs"
          options={{
            title: "FAQs",
            tabBarIcon: ({ size, color }) => (
              <HelpCircle size={size} color={color} />
            ),
          }}
        />

        {/* 👤 Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
});
