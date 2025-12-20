import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
} from "../../src/services/notification.service";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const router = useRouter();

  const loadData = useCallback(async (reset = false) => {
    if (reset) setLoading(true);
    try {
      const data = await getNotifications(1, 50);
      setNotifications(data.notifications || []);
    } catch (e) {
      Alert.alert("Error", "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAction = (item) => {
    // Replicating web link handling [cite: 2005-2006, 2050]
    if (!item.read) markNotificationAsRead(item.id).catch(() => {});

    // Convert web links like '/deals/123' to mobile routes
    const route = item.link.startsWith("/") ? item.link : `/${item.link}`;
    router.push(route);
  };

  const formatDate = (ts) => {
    if (!ts) return "N/A";
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return isNaN(date.getTime()) ? "N/A" : format(date, "MMM dd, h:mm a");
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.unreadCard]}
      onPress={() => handleAction(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.typeIcon}>{getIcon(item.type)}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => deleteNotification(item.id).then(() => loadData())}
        >
          <Ionicons name="trash-outline" size={18} color="#999" />
        </TouchableOpacity>
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {["all", "unread", "read"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.activeFilterText,
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 50 }}
          color="#003366"
          size="large"
        />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications found.</Text>
          }
        />
      )}
    </View>
  );
}

const getIcon = (type) => {
  const icons = {
    deal: "🤝",
    proposal: "📄",
    wallet: "💰",
    milestone: "🎯",
    dispute: "⚖️",
  };
  return icons[type] || "🔔";
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  filterRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    gap: 10,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeFilter: { backgroundColor: "#003366", borderColor: "#003366" },
  filterText: { fontSize: 12, color: "#666", fontWeight: "600" },
  activeFilterText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ddd",
  },
  unreadCard: { borderLeftColor: "#f97316", backgroundColor: "#fff7ed" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  typeIcon: { fontSize: 20, marginRight: 10 },
  headerText: { flex: 1 },
  title: { fontSize: 15, fontWeight: "bold", color: "#333" },
  date: { fontSize: 11, color: "#999", marginTop: 2 },
  message: { fontSize: 13, color: "#666", lineHeight: 18 },
  empty: { textAlign: "center", marginTop: 100, color: "#999" },
});
