import { Tabs, useRouter } from "expo-router";
import {
  Home,
  LayoutDashboard,
  Info,
  HelpCircle,
  Headset,
  BellRing,
  User2Icon,
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
import { NotificationBell } from "../../components/NotificationBell";
import { AppText } from "../../components/ui/AppText";

function TopNavigation() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Logo logic for Light and Dark modes
  const logoLight =
    "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2FIcon%204.png?alt=media&token=bbb32ee1-d121-4f37-b97a-a3b0d82e5297";
  const logoDark =
    "https://firebasestorage.googleapis.com/v0/b/penned-aae02.appspot.com/o/General%2Ficon.png?alt=media&token=71e858f9-ae67-4eb8-82cf-b239ba8d305a";

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Left: Logo and Company Name */}
        <View style={styles.leftSection}>
          <Image
            source={{
              uri: isDark ? logoDark : logoLight,
            }}
            style={styles.logo}
            resizeMode="contain"
          />
          <AppText
            allowFontScaling={false}
            style={[
              styles.companyName,
              {
                color: colors.primary,
              },
            ]}
          >
            Mountescrow
          </AppText>
        </View>

        {/* Right: Notifications and Contact */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/(tabs)/dashboard/profile")}
            activeOpacity={0.7}
          >
            <User2Icon size={24} color={colors.primary} />
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
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="about"
          options={{
            title: "About",
            tabBarIcon: ({ size, color }) => <Info size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ size, color }) => (
              <LayoutDashboard size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="faqs"
          options={{
            title: "Faqs",
            tabBarIcon: ({ size, color }) => (
              <HelpCircle size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="contact"
          options={{
            title: "Contact",
            tabBarIcon: ({ size, color }) => (
              <Headset size={size} color={color} />
            ),
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
