import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getNotificationCount } from "../src/services/notification.service";
import { useTheme } from "../contexts/ThemeContext";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const fetchCount = async () => {
    try {
      const data = await getNotificationCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.warn("Failed to fetch notification count");
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Use white color on dark screen, and theme primary on light screen
  const iconColor = isDark ? "#FFFFFF" : colors.primary;

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/dashboard/notifications")}
      style={styles.container}
    >
      <Ionicons name="notifications-outline" size={24} color={iconColor} />
      {unreadCount > 0 && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.error,
              borderColor: colors.surface,
            },
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[
              styles.badgeText,
              {
                color: "#FFFFFF",
                fontFamily: "Montaga",
              },
            ]}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 5 },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
});
