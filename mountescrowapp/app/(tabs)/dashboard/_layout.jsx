import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Slot, useRouter } from "expo-router";
import { useTheme } from "../../../contexts/ThemeContext";
import { NotificationBell } from "../../../components/NotificationBell";
import { useAuth } from "../../../contexts/AuthContexts";
import {
  Menu,
  X,
  HelpCircle,
  LayoutDashboard,
  FileText,
  Package,
  Wallet,
  Shield,
  BookCheck,
  ArrowBigUpIcon,
} from "lucide-react-native";
import EmailVerificationBanner from "../../../components/EmailVerificationBanner";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = 280;

export default function DashboardSubLayout() {
  const { colors, isDark } = useTheme();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  const toggleSidebar = () => {
    const toValue = isOpen ? -SIDEBAR_WIDTH : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const navigateTo = (path) => {
    toggleSidebar();
    router.push(path);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) return null;

  const NavItem = ({ icon: Icon, label, path }) => (
    <TouchableOpacity style={styles.navItem} onPress={() => navigateTo(path)}>
      {/* Icons set to white for contrast against primary background */}
      <Icon size={20} color="#FFFFFF" />
      <Text
        allowFontScaling={false}
        style={[
          styles.navLabel,
          { color: "#FFFFFF", fontFamily: "sans-serif" },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <EmailVerificationBanner />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={toggleSidebar} style={styles.iconButton}>
          <Menu size={24} color={isDark ? "#FFFFFF" : colors.primary} />
        </TouchableOpacity>

        <Text
          allowFontScaling={false}
          style={[
            styles.headerTitle,
            { color: colors.primary, fontFamily: "sans-serif" },
          ]}
        >
          DASHBOARD
        </Text>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/(tabs)/dashboard/notifications")}
        >
          <NotificationBell />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Background Overlay */}
      {isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleSidebar}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10 },
          ]}
        />
      )}

      {/* Sidebar Navigation */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: colors.primary, // Sidebar background set to Primary Color
            transform: [{ translateX: slideAnim }],
            zIndex: 11,
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <Text
            allowFontScaling={false}
            style={[
              styles.sidebarBrand,
              { color: "#FFFFFF", fontFamily: "sans-serif" },
            ]}
          >
            Mountescrow
          </Text>
          <TouchableOpacity onPress={toggleSidebar}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.navScroll}>
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            path="/(tabs)/dashboard"
          />
          <NavItem
            icon={FileText}
            label="Proposals"
            path="/(tabs)/dashboard/proposals"
          />
          <NavItem
            icon={Package}
            label="Deals"
            path="/(tabs)/dashboard/deals"
          />
          <NavItem
            icon={Wallet}
            label="Wallet"
            path="/(tabs)/dashboard/wallet"
          />
          <NavItem
            icon={ArrowBigUpIcon}
            label="Transactions"
            path="/(tabs)/dashboard/transactions"
          />
          <NavItem icon={BookCheck} label="Kyc" path="/(tabs)/dashboard/kyc" />
          <NavItem
            icon={Shield}
            label="Disputes"
            path="/(tabs)/dashboard/disputes"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  iconButton: { padding: 8 },
  content: { flex: 1 },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 12,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sidebarBrand: { fontSize: 22, fontWeight: "bold" },
  navScroll: { paddingHorizontal: 10 },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  navLabel: { marginLeft: 15, fontSize: 16, fontWeight: "600" },
});
