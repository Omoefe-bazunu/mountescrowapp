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
import { AppText } from "../../../components/ui/AppText";

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
          <AppText style={styles.txDescription} numberOfLines={1}>
            {item.description}
          </AppText>
          <AppText style={styles.txDate}>
            {toDate(item.createdAt)
              ? format(toDate(item.createdAt), "MMM dd, yyyy")
              : "N/A"}
          </AppText>
        </View>
        <View style={styles.txAmountContainer}>
          <AppText
            style={[
              styles.txAmount,
              isCredit ? styles.textGreen : styles.textRed,
            ]}
          >
            {isCredit ? "+" : "-"}₦{Number(item.amount || 0).toLocaleString()}
          </AppText>
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
        <View style={[styles.statCard, { backgroundColor: "#010e5a" }]}>
          <AppText style={styles.statLabel}>Wallet Balance</AppText>
          <AppText style={styles.statValue}>
            ₦{user?.walletBalance?.toLocaleString() ?? "0.00"}
          </AppText>
          <AppText style={styles.statSub}>Available funds</AppText>
        </View>

        <View style={styles.row}>
          <View style={[styles.statCardSmall, { backgroundColor: "#16a34a" }]}>
            <Ionicons name="cube" size={20} color="#fff" />
            <AppText style={styles.statValueSmall}>{stats.activeDeals}</AppText>
            <AppText style={styles.statLabelSmall}>Active Deals</AppText>
          </View>

          <View style={[styles.statCardSmall, { backgroundColor: "#071495" }]}>
            <Ionicons name="document-text" size={20} color="#fff" />
            <AppText style={styles.statValueSmall}>
              {stats.pendingProposals}
            </AppText>
            <AppText style={styles.statLabelSmall}>Pending Proposals</AppText>
          </View>
        </View>
      </View>

      {/* Transactions Section */}
      <View style={styles.sectionHeader}>
        <View>
          <AppText style={styles.sectionTitle}>Recent Transactions</AppText>
          <AppText style={styles.sectionSub}>Your last 5 transactions</AppText>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/dashboard/transactions")}
        >
          <AppText style={styles.viewAll}>View All</AppText>
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
          <AppText style={styles.emptyText}>No recent transactions.</AppText>
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
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#010e5a" },
  sectionSub: { fontSize: 12, color: "#666" },
  viewAll: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "#010e5a",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
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
