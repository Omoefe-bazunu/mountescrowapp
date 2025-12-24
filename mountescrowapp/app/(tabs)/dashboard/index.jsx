import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../contexts/AuthContexts";
import apiClient from "../../../src/api/apiClient";

export default function DashboardOverview() {
  const { user, loading: authLoading, refresh: refreshUser } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ activeDeals: 0, pendingProposals: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchDashboardData();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const fetchDashboardData = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const res = await apiClient.get("/dashboard/data");
      const data = res.data;
      setStats({
        activeDeals: data.activeDeals || 0,
        pendingProposals: data.pendingProposals || 0,
      });
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardData(true),
      refreshUser ? refreshUser() : Promise.resolve(),
    ]);
  }, [refreshUser]);

  const toDate = (input) => {
    if (!input) return null;
    if (input.seconds || input._seconds) {
      return new Date((input.seconds || input._seconds) * 1000);
    }
    return new Date(input);
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // ✅ UPDATED LOGIC TO MATCH TRANSACTIONS SCREEN
  const renderTransaction = ({ item }) => {
    // Logic matches TransactionsScreen
    const isCredit =
      item.type === "credit" || // Added this missing check
      item.type === "DEPOSIT" ||
      item.type === "MILESTONE_PAYMENT" ||
      item.direction === "incoming";

    return (
      <View style={styles.txRow} key={item.id}>
        <View style={styles.txInfo}>
          <Text style={styles.txDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.txDate}>
            {toDate(item.createdAt)
              ? format(toDate(item.createdAt), "MMM dd, yyyy")
              : "N/A"}
          </Text>
        </View>
        <View style={styles.txAmountContainer}>
          <Text
            style={[
              styles.txAmount,
              isCredit ? styles.textGreen : styles.textRed,
            ]}
          >
            {isCredit ? "+" : "-"}₦{Number(item.amount || 0).toLocaleString()}
          </Text>
          <Ionicons
            name={isCredit ? "arrow-down-circle" : "arrow-up-circle"} // Matching icons (Down = In/Green, Up = Out/Red)
            size={16}
            color={isCredit ? "#16a34a" : "#dc2626"}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#f97316"]}
          tintColor="#f97316"
        />
      }
    >
      {/* Stats Cards Section */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#003366" }]}>
          <Text style={styles.statLabel}>Wallet Balance</Text>
          <Text style={styles.statValue}>
            ₦{user?.walletBalance?.toLocaleString() ?? "0.00"}
          </Text>
          <Text style={styles.statSub}>Available funds</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.statCardSmall, { backgroundColor: "#16a34a" }]}>
            <Ionicons name="cube" size={20} color="#fff" />
            <Text style={styles.statValueSmall}>{stats.activeDeals}</Text>
            <Text style={styles.statLabelSmall}>Active Deals</Text>
          </View>

          <View style={[styles.statCardSmall, { backgroundColor: "#3b82f6" }]}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.statValueSmall}>{stats.pendingProposals}</Text>
            <Text style={styles.statLabelSmall}>Pending Proposals</Text>
          </View>
        </View>
      </View>

      {/* Transactions Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Text style={styles.sectionSub}>Your last 5 transactions</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/dashboard/transactions")}
        >
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.txListCard}>
        {transactions.length > 0 ? (
          transactions.slice(0, 5).map((tx) => (
            <React.Fragment key={tx.id}>
              {renderTransaction({ item: tx })}
              <View style={styles.separator} />
            </React.Fragment>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent transactions.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContent: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsGrid: { marginBottom: 20 },
  statCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  statLabel: { color: "#fff", opacity: 0.8, fontSize: 14, marginBottom: 4 },
  statValue: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  statSub: { color: "#fff", opacity: 0.7, fontSize: 12, marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  statCardSmall: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  statValueSmall: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabelSmall: { color: "#fff", fontSize: 12, opacity: 0.9 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#003366" },
  sectionSub: { fontSize: 12, color: "#666" },
  viewAll: { color: "#f97316", fontWeight: "bold", fontSize: 14 },
  txListCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  txInfo: { flex: 1 },
  txDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  txDate: { fontSize: 12, color: "#999" },
  txAmountContainer: { alignItems: "flex-end" },
  txAmount: { fontSize: 15, fontWeight: "bold", marginBottom: 2 },
  textGreen: { color: "#16a34a" },
  textRed: { color: "#dc2626" },
  separator: { height: 1, backgroundColor: "#eee" },
  emptyText: { textAlign: "center", py: 20, color: "#999" },
});
