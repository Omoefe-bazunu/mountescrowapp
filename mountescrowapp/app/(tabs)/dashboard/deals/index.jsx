import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput, // Added TextInput
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../contexts/AuthContexts";
import apiClient from "../../../../src/api/apiClient";

export default function DealsScreen() {
  const { user, loading: authLoading } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search
  const router = useRouter();

  const fetchDeals = async () => {
    try {
      const res = await apiClient.get("/deals");
      setDeals(res.data.deals || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter deals based on search query
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) =>
      deal.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deals, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeals();
  }, []);

  useEffect(() => {
    if (user) fetchDeals();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "#3b82f6";
      case "Completed":
        return "#16a34a";
      case "In Dispute":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const renderDeal = ({ item }) => {
    const isBuyer =
      item.buyerId === user?.uid || item.buyerEmail === user?.email;
    return (
      <TouchableOpacity
        style={styles.dealCard}
        onPress={() => router.push(`/(tabs)/dashboard/deals/${item.id}`)}
      >
        <View style={styles.dealHeader}>
          <Text style={styles.projectTitle}>{item.projectTitle}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
        <View style={styles.dealFooter}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{isBuyer ? "Buyer" : "Seller"}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.amountText}>
            ₦{(item.totalAmount + item.escrowFee).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing)
    return (
      <ActivityIndicator style={styles.loader} size="large" color="#f97316" />
    );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search deals..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredDeals}
        renderItem={renderDeal}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f97316"]}
            tintColor="#f97316"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No matching deals" : "No active deals yet"}
            </Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? "Try a different search term"
                : "Accepted proposals will appear here."}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  loader: { flex: 1, justifyContent: "center" },
  searchSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  listContent: { padding: 16, paddingBottom: 100 },
  dealCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  projectTitle: { fontSize: 16, fontWeight: "bold", color: "#003366" },
  dealFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roleBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: { fontSize: 12, color: "#666" },
  statusContainer: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 13, color: "#444" },
  amountText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 12,
  },
  emptySub: { color: "#999", marginTop: 8, textAlign: "center" },
});
