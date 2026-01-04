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
  RefreshControl,
} from "react-native";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../../../src/api/apiClient";
import { AppText } from "../../../../components/ui/AppText";

// ✅ FIX: Moved renderTransaction OUTSIDE the component
// This prevents the FlatList from re-rendering every row when state changes (like searching)
const renderTransaction = ({ item }) => {
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
          <AppText style={styles.txDescription}>
            {item.description || "Transaction"}
          </AppText>
          <AppText style={styles.txDate}>
            {item.createdAt
              ? format(new Date(item.createdAt), "MMM dd, yyyy • p")
              : "N/A"}
          </AppText>
        </View>

        <View style={styles.txAmount}>
          <AppText
            style={[styles.amountText, isCredit ? styles.green : styles.red]}
          >
            {isCredit ? "+" : "-"}₦
            {Number(item.amount || 0).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </AppText>
          <View
            style={[styles.badge, styles[`badge${item.status?.toUpperCase()}`]]}
          >
            <AppText style={styles.badgeText}>
              {item.status?.toLowerCase() || "pending"}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions(true);
  }, []);

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

        <AppText style={styles.filterLabel}>Filter by Type</AppText>
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
              <AppText
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
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#010e5a" />
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
              colors={["#010e5a"]}
              tintColor="#010e5a"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <AppText style={styles.emptyText}>No transactions found.</AppText>
            </View>
          }
          // Optimization props to further prevent crashes on long lists
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
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
  activeChip: { backgroundColor: "#010e5a", borderColor: "#010e5a" },
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
    flex: 1,
    marginRight: 10,
  },
  txDescription: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  txDate: { fontSize: 12, color: "#999" },
  txAmount: {
    alignItems: "flex-end",
    flexShrink: 0,
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
  emptyText: {
    marginTop: 16,
    color: "#999",
    fontSize: 16,
    fontWeight: "500",
  },
});
