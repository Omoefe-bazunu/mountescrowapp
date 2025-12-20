import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useAuth } from "../../../../contexts/AuthContexts";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import apiClient from "../../../../src/api/apiClient";

export default function AdminDashboardScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [activeList, setActiveList] = useState("users");
  const [data, setData] = useState({
    users: [],
    proposals: [],
    deals: [],
    disputes: [],
    messages: [],
  });
  const [loading, setLoading] = useState(true);

  // Admin Guard
  useEffect(() => {
    if (!authLoading && user) {
      const isAdmin = ["raniem57@gmail.com", "mountescrow@gmail.com"].includes(
        user.email
      );
      if (!isAdmin) {
        Alert.alert("Access Denied", "Admin access required");
        router.replace("/(tabs)/dashboard");
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Parallel fetching logic [cite: 944-945]
      const [
        statsRes,
        usersRes,
        proposalsRes,
        dealsRes,
        disputesRes,
        contactRes,
      ] = await Promise.all([
        apiClient.get("/admin/dashboard-stats"),
        apiClient.get("/admin/users"),
        apiClient.get("/admin/proposals"),
        apiClient.get("/admin/deals"),
        apiClient.get("/admin/disputes"),
        apiClient.get("/admin/contact-submissions"),
      ]);

      setStats(statsRes.data.stats);
      setData({
        users: usersRes.data.users || [],
        proposals: proposalsRes.data.proposals || [],
        deals: dealsRes.data.deals || [],
        disputes: disputesRes.data.disputes || [],
        messages: contactRes.data.submissions || [],
      });
    } catch (err) {
      console.error("Admin fetch error:", err);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    `₦${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    // Dynamic rendering based on active tab [cite: 1003, 1011, 1019, 1027, 1036]
    switch (activeList) {
      case "users":
        return (
          <View style={styles.listItem}>
            <View>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSub}>{item.email}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.kycStatus}</Text>
            </View>
          </View>
        );
      case "proposals":
        return (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.projectTitle}
              </Text>
              <Text style={styles.itemSub}>{item.creatorEmail}</Text>
            </View>
            <Text style={styles.itemAmount}>
              {formatCurrency(item.totalAmount)}
            </Text>
          </View>
        );
      case "disputes":
        return (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.projectTitle}</Text>
              <Text style={styles.itemSub}>By: {item.raisedByEmail}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "#fee2e2" }]}>
              <Text
                style={{ color: "#ef4444", fontSize: 10, fontWeight: "bold" }}
              >
                DISPUTE
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading || authLoading)
    return (
      <ActivityIndicator style={styles.centered} size="large" color="#003366" />
    );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.headerScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Admin Dashboard</Text>

        {/* Stats Grid [cite: 958-965] */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            "Total Users",
            stats?.totalUsers || 0,
            "people",
            "#3b82f6"
          )}
          {renderStatCard(
            "Active Deals",
            stats?.totalDeals || 0,
            "briefcase",
            "#a855f7"
          )}
          {renderStatCard(
            "Revenue",
            formatCurrency(stats?.totalRevenue),
            "cash",
            "#f97316"
          )}
          {renderStatCard(
            "Disputes",
            stats?.totalDisputes || 0,
            "alert-circle",
            "#ef4444"
          )}
        </View>

        {/* Tab Selector  */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
        >
          {["users", "proposals", "deals", "disputes", "messages"].map(
            (tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveList(tab)}
                style={[styles.tab, activeList === tab && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeList === tab && styles.activeTabText,
                  ]}
                >
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>
      </ScrollView>

      {/* Data List [cite: 979, 1000, 1008, 1016, 1024, 1033] */}
      <FlatList
        data={data[activeList]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No records found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center" },
  headerScroll: { flexGrow: 0, padding: 20 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
  },
  statTitle: { fontSize: 12, color: "#666", marginTop: 8 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 4 },
  tabBar: { flexDirection: "row", marginTop: 10, marginBottom: 5 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  activeTab: { backgroundColor: "#003366" },
  tabText: { fontSize: 12, fontWeight: "bold", color: "#666" },
  activeTabText: { color: "#fff" },
  listContent: { padding: 20 },
  listItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
  itemSub: { fontSize: 12, color: "#999", marginTop: 2 },
  itemAmount: { fontWeight: "bold", color: "#003366" },
  badge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, color: "#666" },
  empty: { textAlign: "center", marginTop: 50, color: "#ccc" },
});
