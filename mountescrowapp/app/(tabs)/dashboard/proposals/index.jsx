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
import { getProposals } from "../../../../src/services/proposal.service";
import { AppText } from "../../../../components/ui/AppText";

export default function ProposalsScreen() {
  const { user, loading: authLoading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search
  const router = useRouter();

  const fetchProposals = async () => {
    try {
      const data = await getProposals();
      // Sort: Newest first
      data.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      setProposals(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Real-time filtering logic
  const filteredProposals = useMemo(() => {
    return proposals.filter(
      (p) =>
        p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sellerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [proposals, searchQuery]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    fetchProposals();
  }, []);

  useEffect(() => {
    if (user) fetchProposals();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "#16a34a";
      case "Declined":
        return "#ef4444";
      case "Pending":
        return "#f97316";
      default:
        return "#6b7280";
    }
  };

  const renderProposal = ({ item }) => {
    const isBuyer = user?.uid === item.buyerId;
    const otherParty = isBuyer ? item.sellerEmail : item.buyerEmail;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tabs)/dashboard/proposals/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <AppText style={styles.title} numberOfLines={1}>
            {item.projectTitle}
          </AppText>
          <AppText
            style={[styles.status, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </AppText>
        </View>
        <AppText style={styles.subText}>
          {isBuyer ? "Seller" : "Buyer"}: {otherParty}
        </AppText>
        <View style={styles.cardFooter}>
          <AppText style={styles.amount}>
            ₦{(item.totalAmount + item.escrowFee).toLocaleString()}
          </AppText>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !isRefreshing)
    return (
      <ActivityIndicator
        style={styles.centeredLoader}
        size="large"
        color="#f97316"
      />
    );

  return (
    <View style={styles.container}>
      {/* Search Header Area */}
      <View style={styles.topActions}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search proposals..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push("/(tabs)/dashboard/proposals/new")}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <AppText style={styles.newBtnText}>New</AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProposals}
        renderItem={renderProposal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#f97316"]}
            tintColor="#f97316"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={searchQuery ? "search-outline" : "document-outline"}
              size={50}
              color="#ccc"
            />
            <AppText style={styles.emptyTitle}>
              {searchQuery ? "No results found" : "No proposals yet"}
            </AppText>
            <AppText style={styles.emptySub}>
              {searchQuery
                ? `We couldn't find "${searchQuery}"`
                : "Your created and received proposals will appear here."}
            </AppText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  centeredLoader: { flex: 1, justifyContent: "center", alignItems: "center" },
  topActions: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  newBtn: {
    backgroundColor: "#f97316",
    flexDirection: "row",
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 45,
  },
  newBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 4 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: "bold", color: "#010e5a", flex: 1 },
  status: { fontSize: 12, fontWeight: "600" },
  subText: { fontSize: 13, color: "#666", marginBottom: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: { fontSize: 15, fontWeight: "bold", color: "#333" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 15,
  },
  emptySub: {
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
