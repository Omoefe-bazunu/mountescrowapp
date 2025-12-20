import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl, // Added for pull-to-refresh
} from "react-native";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../../../src/api/apiClient";

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // New state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const res = await apiClient.get("/transactions");
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions(true);
  }, []);

  // Logic ported from Next.js [cite: 531]
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchMatch =
        searchTerm === "" ||
        (tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);

      const typeMatch = typeFilter === "all" || tx.type === typeFilter;

      const statusMatch =
        statusFilter === "all" ||
        tx.status?.toLowerCase() === statusFilter.toLowerCase();

      return searchMatch && typeMatch && statusMatch;
    });
  }, [transactions, searchTerm, typeFilter, statusFilter]);

  const renderTransaction = ({ item }) => {
    // Logic for determining direction [cite: 531]
    const isCredit =
      item.type === "credit" ||
      item.type === "DEPOSIT" ||
      item.type === "MILESTONE_PAYMENT" ||
      item.direction === "incoming";

    return (
      <View style={styles.txCard}>
        <View style={styles.txMain}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isCredit ? "arrow-down-circle" : "arrow-up-circle"}
              size={32}
              color={isCredit ? "#16a34a" : "#dc2626"}
            />
          </View>

          <View style={styles.txDetails}>
            <Text style={styles.txDescription}>
              {item.description || "Transaction"}
            </Text>
            <Text style={styles.txDate}>
              {item.createdAt
                ? format(new Date(item.createdAt), "MMM dd, yyyy • p")
                : "N/A"}
            </Text>
          </View>

          <View style={styles.txAmount}>
            <Text
              style={[styles.amountText, isCredit ? styles.green : styles.red]}
            >
              {isCredit ? "+" : "-"}₦
              {Number(item.amount || 0).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <View
              style={[
                styles.badge,
                styles[`badge${item.status?.toUpperCase()}`],
              ]}
            >
              <Text style={styles.badgeText}>
                {item.status?.toLowerCase() || "pending"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.filterLabel}>Filter by Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipBar}
        >
          {["all", "credit", "debit"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, typeFilter === type && styles.activeChip]}
              onPress={() => setTypeFilter(type)}
            >
              <Text
                style={[
                  styles.chipText,
                  typeFilter === type && styles.activeChipText,
                ]}
              >
                {type === "credit"
                  ? "Deposits"
                  : type === "debit"
                  ? "Withdrawals"
                  : "All"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#003366"]} // Android
              tintColor="#003366" // iOS
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No transactions found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: "#333" },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  chipBar: { flexDirection: "row", marginBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeChip: { backgroundColor: "#003366", borderColor: "#003366" },
  chipText: { fontSize: 13, color: "#666", fontWeight: "600" },
  activeChipText: { color: "#fff" },
  listContent: { padding: 16, paddingBottom: 40 },
  txCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  txMain: { flexDirection: "row", alignItems: "center" },
  iconContainer: { marginRight: 12 },
  txDetails: {
    flex: 1, // Added to allow text to take remaining space and wrap
    marginRight: 10, // Safety gap
  },
  txDescription: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
    flexWrap: "wrap", // Ensures text breaks to new lines
  },
  txDate: { fontSize: 12, color: "#999" },
  txAmount: {
    alignItems: "flex-end",
    flexShrink: 0, // Prevents amount from being compressed
  },
  amountText: { fontSize: 15, fontWeight: "bold", marginBottom: 6 },
  green: { color: "#16a34a" },
  red: { color: "#dc2626" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#f1f3f5",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    color: "#666",
  },
  badgeSUCCESS: { backgroundColor: "#dcfce7" },
  badgeFAILED: { backgroundColor: "#fee2e2" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: { marginTop: 16, color: "#999", fontSize: 16, fontWeight: "500" },
});
