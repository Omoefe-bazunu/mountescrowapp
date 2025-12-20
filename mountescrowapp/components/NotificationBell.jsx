import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getNotificationCount } from "../src/services/notification.service";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

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
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/notifications")}
      style={styles.container}
    >
      <Ionicons name="notifications-outline" size={24} color="#003366" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
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
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});
