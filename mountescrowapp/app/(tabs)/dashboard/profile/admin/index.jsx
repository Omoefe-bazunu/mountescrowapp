import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Modal,
  Pressable,
  RefreshControl, // Import RefreshControl
} from "react-native";
import { useAuth } from "../../../../../contexts/AuthContexts";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import apiClient from "../../../../../src/api/apiClient";

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
  const [refreshing, setRefreshing] = useState(false); // Refresh state

  // Search & UI State
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

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
    // Only set main loading if not refreshing (to avoid flickering)
    if (!refreshing) setLoading(true);
    try {
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
      setRefreshing(false);
    }
  };

  // Pull-to-Refresh Handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAdminData();
  }, []);

  const formatCurrency = (val) =>
    `₦${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "Invalid Date";
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    const list = data[activeList] || [];
    if (!searchText) return list;

    const lowerSearch = searchText.toLowerCase();

    return list.filter((item) => {
      if (activeList === "users") {
        return (
          item.name?.toLowerCase().includes(lowerSearch) ||
          item.email?.toLowerCase().includes(lowerSearch)
        );
      }
      if (activeList === "proposals" || activeList === "deals") {
        return (
          item.projectTitle?.toLowerCase().includes(lowerSearch) ||
          item.buyerEmail?.toLowerCase().includes(lowerSearch) ||
          item.sellerEmail?.toLowerCase().includes(lowerSearch)
        );
      }
      if (activeList === "disputes") {
        return (
          item.projectTitle?.toLowerCase().includes(lowerSearch) ||
          item.raisedByEmail?.toLowerCase().includes(lowerSearch) ||
          item.reason?.toLowerCase().includes(lowerSearch)
        );
      }
      if (activeList === "messages") {
        return (
          item.name?.toLowerCase().includes(lowerSearch) ||
          item.email?.toLowerCase().includes(lowerSearch) ||
          item.message?.toLowerCase().includes(lowerSearch)
        );
      }
      return false;
    });
  }, [data, activeList, searchText]);

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  // --- HEADER COMPONENT (Stats + Controls) ---
  const renderDashboardHeader = () => (
    <View>
      {/* Stats Grid */}
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

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        {/* Custom Select Dropdown */}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowDropdown(true)}
        >
          <Text style={styles.selectButtonText}>{listLabels[activeList]}</Text>
          <Ionicons name="chevron-down" size={20} color="#003366" />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${listLabels[activeList]}...`}
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;

    if (activeList === "users") {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSub}>{item.email}</Text>
              <Text style={styles.itemMeta}>
                Joined: {formatDate(item.createdAt)}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                item.kycStatus === "approved"
                  ? styles.badgeSuccess
                  : styles.badgePending,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  item.kycStatus === "approved"
                    ? styles.textSuccess
                    : styles.textPending,
                ]}
              >
                {item.kycStatus?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    if (activeList === "proposals" || activeList === "deals") {
      const milestoneCount = item.milestones?.length || 0;

      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.projectTitle}
              </Text>
              {/* <Text style={styles.itemMeta}>
                {milestoneCount} Milestones •{" "}
                {activeList === "proposals" ? "Created" : "Funded"}:{" "}
                {formatDate(item.createdAt || item.fundedAt)}
              </Text> */}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.itemAmount}>
                {formatCurrency(item.totalAmount)}
              </Text>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#999"
              />
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{item.status}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Buyer:</Text>
                <Text style={styles.detailValue}>
                  {item.buyerEmail || "N/A"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seller:</Text>
                <Text style={styles.detailValue}>
                  {item.sellerEmail || "N/A"}
                </Text>
              </View>

              {/* <View style={styles.divider} />
              <Text style={styles.sectionHeader}>Milestones & Amounts</Text>
              {item.milestones && Array.isArray(item.milestones) ? (
                item.milestones.map((m, idx) => (
                  <View key={idx} style={styles.milestoneRow}>
                    <Text style={styles.milestoneIndex}>#{idx + 1}</Text>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={styles.milestoneTitle}>{m.title}</Text>
                      <Text style={styles.milestoneStatus}>
                        Due: {formatDate(m.dueDate)}
                      </Text>
                    </View>
                    <Text style={styles.milestoneAmount}>
                      {formatCurrency(m.amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.itemMeta}>No milestones found</Text>
              )} */}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (activeList === "disputes") {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.projectTitle}</Text>
              <Text style={styles.itemSub}>
                Raised By: {item.raisedByEmail}
              </Text>
              <Text style={styles.itemMeta}>
                Date: {formatDate(item.createdAt)}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View style={[styles.badge, styles.badgeDanger]}>
                <Text style={styles.textDanger}>DISPUTE</Text>
              </View>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Milestone Index:</Text>
                <Text style={styles.detailValue}>
                  #{Number(item.milestoneIndex) + 1}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Buyer:</Text>
                <Text style={styles.detailValue}>{item.buyerEmail}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seller:</Text>
                <Text style={styles.detailValue}>{item.sellerEmail}</Text>
              </View>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Reason:</Text>
                <Text style={styles.reasonText}>{item.reason}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (activeList === "messages") {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text
                style={styles.itemSub}
                numberOfLines={isExpanded ? undefined : 1}
              >
                {item.message}
              </Text>
            </View>
            <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
          </View>
          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.itemMeta}>
                {item.email} • {item.phone}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return null;
  };

  const listLabels = {
    users: "Users",
    proposals: "Proposals",
    deals: "Deals",
    disputes: "Disputes",
    messages: "Support Messages",
  };

  if (loading || authLoading)
    return (
      <ActivityIndicator style={styles.centered} size="large" color="#003366" />
    );

  return (
    <View style={styles.container}>
      {/* Fixed Header (Title & Back Button) */}
      <View style={styles.headerContainer}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/dashboard/profile")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#003366" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Admin Dashboard</Text>
        </View>
      </View>

      {/* Main Content List with Refresh Control */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderDashboardHeader} // Stats & Controls here
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searchText ? "No matches found." : "No records found."}
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#003366"]} // Android
            tintColor="#003366" // iOS
          />
        }
      />

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            <Text style={styles.dropdownHeader}>Select Category</Text>
            {Object.entries(listLabels).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.dropdownItem,
                  activeList === key && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setActiveList(key);
                  setShowDropdown(false);
                  setSearchText(""); // Reset search on change
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    activeList === key && styles.dropdownTextActive,
                  ]}
                >
                  {label}
                </Text>
                {activeList === key && (
                  <Ionicons name="checkmark" size={18} color="#003366" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center" },

  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#f8f9fa",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#003366",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statTitle: { fontSize: 12, color: "#666", marginTop: 8 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 4 },

  // Controls Section
  controlsSection: {
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },

  // Dropdown Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    elevation: 5,
  },
  dropdownHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#94a3b8",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: "#f0f9ff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#334155",
  },
  dropdownTextActive: {
    color: "#003366",
    fontWeight: "600",
  },

  // List Items
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  // Text Styles
  itemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  itemSub: { fontSize: 13, color: "#64748b", marginBottom: 2 },
  itemMeta: { fontSize: 11, color: "#94a3b8" },
  itemAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 11,
    color: "#94a3b8",
    minWidth: 70,
    textAlign: "right",
  },

  // Expandable Section
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailBlock: {
    marginTop: 6,
  },
  detailLabel: {
    width: 80,
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    color: "#334155",
    fontWeight: "500",
  },
  reasonText: {
    marginTop: 2,
    fontSize: 13,
    color: "#ef4444",
    fontStyle: "italic",
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 6,
  },

  // Milestones
  sectionHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 8,
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  milestoneIndex: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#94a3b8",
    width: 25,
  },
  milestoneTitle: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  milestoneStatus: {
    fontSize: 10,
    color: "#64748b",
  },
  milestoneAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },

  // Badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeSuccess: { backgroundColor: "#dcfce7" },
  badgePending: { backgroundColor: "#f1f5f9" },
  badgeDanger: { backgroundColor: "#fee2e2" },
  textSuccess: { fontSize: 10, fontWeight: "bold", color: "#16a34a" },
  textPending: { fontSize: 10, fontWeight: "bold", color: "#64748b" },
  textDanger: { fontSize: 10, fontWeight: "bold", color: "#ef4444" },

  empty: { textAlign: "center", marginTop: 50, color: "#94a3b8" },
});
