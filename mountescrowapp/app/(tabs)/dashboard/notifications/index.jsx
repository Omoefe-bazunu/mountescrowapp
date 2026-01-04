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
} from "../../../../src/services/notification.service";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const loadData = useCallback(async (reset = false) => {
    if (reset) setLoading(true);
    try {
      const data = await getNotifications(1, 50);
      setNotifications(data.notifications || []);
    } catch (e) {
      console.log(e);
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

  // ✅ UPDATED: Navigation Handler
  const handleAction = async (item) => {
    // 1. Optimistic Update (Mark read in UI immediately)
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      // Call API in background
      markNotificationAsRead(item.id).catch(() => {});
    }

    // 2. Parse Link & Navigate
    if (!item.link) return;

    // Remove leading slash if exists (e.g. "/proposals/123" -> "proposals/123")
    const cleanPath = item.link.startsWith("/")
      ? item.link.slice(1)
      : item.link;
    const [category, id] = cleanPath.split("/");

    // Map Web Categories to Mobile Routes
    // Adjust these paths if your file structure is different
    switch (category) {
      case "proposals":
        // Maps 'proposals/123' -> '/dashboard/proposals/123'
        router.push(`/(tabs)/dashboard/proposals/${id}`);
        break;
      case "deals":
        router.push(`/(tabs)/dashboard/deals/${id}`);
        break;
      case "disputes":
        router.push(`/(tabs)/dashboard/disputes`);
        break;
      case "wallet":
        router.push("/(tabs)/dashboard/wallet");
        break;
      default:
        // Fallback for unknown routes
        router.push(`/${cleanPath}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsAsRead();
      await loadData();
    } catch (e) {
      Alert.alert("Error", "Failed to mark notifications as read");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to remove this?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setNotifications((prev) => prev.filter((n) => n.id !== id));
              await deleteNotification(id);
            } catch (e) {
              Alert.alert("Error", "Failed to delete");
              loadData();
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    let date;
    if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }
    return date && !isNaN(date) ? format(date, "MMM dd, p") : "N/A";
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
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.typeIcon}>{getIcon(item.type)}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/dashboard")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
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

      {/* List */}
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
          contentContainerStyle={{ paddingBottom: 20 }}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#003366",
  },
  markReadText: {
    fontSize: 14,
    color: "#f97316",
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  activeFilter: { backgroundColor: "#003366", borderColor: "#003366" },
  filterText: { fontSize: 12, color: "#666", fontWeight: "600" },
  activeFilterText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#e5e7eb",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadCard: { borderLeftColor: "#f97316", backgroundColor: "#fff7ed" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  typeIcon: { fontSize: 20, marginRight: 12, marginTop: 2 },
  headerText: { flex: 1, marginRight: 8 },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  date: { fontSize: 11, color: "#9ca3af" },
  deleteBtn: {
    padding: 4,
  },
  message: { fontSize: 14, color: "#4b5563", lineHeight: 20 },
  empty: { textAlign: "center", marginTop: 100, color: "#9ca3af" },
});
