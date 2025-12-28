// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   TextInput,
//   Modal,
//   Pressable,
//   RefreshControl, // Import RefreshControl
// } from "react-native";
// import { useAuth } from "../../../../../contexts/AuthContexts";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { format } from "date-fns";
// import apiClient from "../../../../../src/api/apiClient";

// export default function AdminDashboardScreen() {
//   const { user, loading: authLoading } = useAuth();
//   const router = useRouter();

//   const [stats, setStats] = useState(null);
//   const [activeList, setActiveList] = useState("users");
//   const [data, setData] = useState({
//     users: [],
//     proposals: [],
//     deals: [],
//     disputes: [],
//     messages: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false); // Refresh state

//   // Search & UI State
//   const [searchText, setSearchText] = useState("");
//   const [expandedId, setExpandedId] = useState(null);
//   const [showDropdown, setShowDropdown] = useState(false);

//   // Admin Guard
//   useEffect(() => {
//     if (!authLoading && user) {
//       const isAdmin = ["raniem57@gmail.com", "mountescrow@gmail.com"].includes(
//         user.email
//       );
//       if (!isAdmin) {
//         Alert.alert("Access Denied", "Admin access required");
//         router.replace("/(tabs)/dashboard");
//       } else {
//         fetchAdminData();
//       }
//     }
//   }, [user, authLoading]);

//   const fetchAdminData = async () => {
//     // Only set main loading if not refreshing (to avoid flickering)
//     if (!refreshing) setLoading(true);
//     try {
//       const [
//         statsRes,
//         usersRes,
//         proposalsRes,
//         dealsRes,
//         disputesRes,
//         contactRes,
//       ] = await Promise.all([
//         apiClient.get("/admin/dashboard-stats"),
//         apiClient.get("/admin/users"),
//         apiClient.get("/admin/proposals"),
//         apiClient.get("/admin/deals"),
//         apiClient.get("/admin/disputes"),
//         apiClient.get("/admin/contact-submissions"),
//       ]);

//       setStats(statsRes.data.stats);
//       setData({
//         users: usersRes.data.users || [],
//         proposals: proposalsRes.data.proposals || [],
//         deals: dealsRes.data.deals || [],
//         disputes: disputesRes.data.disputes || [],
//         messages: contactRes.data.submissions || [],
//       });
//     } catch (err) {
//       console.error("Admin fetch error:", err);
//       Alert.alert("Error", "Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Pull-to-Refresh Handler
//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchAdminData();
//   }, []);

//   const formatCurrency = (val) =>
//     `₦${Number(val || 0).toLocaleString(undefined, {
//       minimumFractionDigits: 2,
//     })}`;

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       return format(new Date(dateString), "MMM dd, yyyy");
//     } catch (e) {
//       return "Invalid Date";
//     }
//   };

//   const toggleExpand = (id) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   // Filter Logic
//   const filteredData = useMemo(() => {
//     const list = data[activeList] || [];
//     if (!searchText) return list;

//     const lowerSearch = searchText.toLowerCase();

//     return list.filter((item) => {
//       if (activeList === "users") {
//         return (
//           item.name?.toLowerCase().includes(lowerSearch) ||
//           item.email?.toLowerCase().includes(lowerSearch)
//         );
//       }
//       if (activeList === "proposals" || activeList === "deals") {
//         return (
//           item.projectTitle?.toLowerCase().includes(lowerSearch) ||
//           item.buyerEmail?.toLowerCase().includes(lowerSearch) ||
//           item.sellerEmail?.toLowerCase().includes(lowerSearch)
//         );
//       }
//       if (activeList === "disputes") {
//         return (
//           item.projectTitle?.toLowerCase().includes(lowerSearch) ||
//           item.raisedByEmail?.toLowerCase().includes(lowerSearch) ||
//           item.reason?.toLowerCase().includes(lowerSearch)
//         );
//       }
//       if (activeList === "messages") {
//         return (
//           item.name?.toLowerCase().includes(lowerSearch) ||
//           item.email?.toLowerCase().includes(lowerSearch) ||
//           item.message?.toLowerCase().includes(lowerSearch)
//         );
//       }
//       return false;
//     });
//   }, [data, activeList, searchText]);

//   const renderStatCard = (title, value, icon, color) => (
//     <View style={[styles.statCard, { borderLeftColor: color }]}>
//       <Ionicons name={icon} size={20} color={color} />
//       <Text style={styles.statTitle}>{title}</Text>
//       <Text style={styles.statValue}>{value}</Text>
//     </View>
//   );

//   // --- HEADER COMPONENT (Stats + Controls) ---
//   const renderDashboardHeader = () => (
//     <View>
//       {/* Stats Grid */}
//       <View style={styles.statsGrid}>
//         {renderStatCard(
//           "Total Users",
//           stats?.totalUsers || 0,
//           "people",
//           "#3b82f6"
//         )}
//         {renderStatCard(
//           "Active Deals",
//           stats?.totalDeals || 0,
//           "briefcase",
//           "#a855f7"
//         )}
//         {renderStatCard(
//           "Revenue",
//           formatCurrency(stats?.totalRevenue),
//           "cash",
//           "#f97316"
//         )}
//         {renderStatCard(
//           "Disputes",
//           stats?.totalDisputes || 0,
//           "alert-circle",
//           "#ef4444"
//         )}
//       </View>

//       {/* Controls Section */}
//       <View style={styles.controlsSection}>
//         {/* Custom Select Dropdown */}
//         <TouchableOpacity
//           style={styles.selectButton}
//           onPress={() => setShowDropdown(true)}
//         >
//           <Text style={styles.selectButtonText}>{listLabels[activeList]}</Text>
//           <Ionicons name="chevron-down" size={20} color="#003366" />
//         </TouchableOpacity>

//         {/* Search Bar */}
//         <View style={styles.searchBox}>
//           <Ionicons name="search" size={18} color="#94a3b8" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder={`Search ${listLabels[activeList]}...`}
//             placeholderTextColor="#94a3b8"
//             value={searchText}
//             onChangeText={setSearchText}
//           />
//           {searchText.length > 0 && (
//             <TouchableOpacity onPress={() => setSearchText("")}>
//               <Ionicons name="close-circle" size={18} color="#94a3b8" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </View>
//   );

//   const renderItem = ({ item }) => {
//     const isExpanded = expandedId === item.id;

//     if (activeList === "users") {
//       return (
//         <View style={styles.card}>
//           <View style={styles.cardHeader}>
//             <View>
//               <Text style={styles.itemTitle}>{item.name}</Text>
//               <Text style={styles.itemSub}>{item.email}</Text>
//               <Text style={styles.itemMeta}>
//                 Joined: {formatDate(item.createdAt)}
//               </Text>
//             </View>
//             <View
//               style={[
//                 styles.badge,
//                 item.kycStatus === "approved"
//                   ? styles.badgeSuccess
//                   : styles.badgePending,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.badgeText,
//                   item.kycStatus === "approved"
//                     ? styles.textSuccess
//                     : styles.textPending,
//                 ]}
//               >
//                 {item.kycStatus?.toUpperCase()}
//               </Text>
//             </View>
//           </View>
//         </View>
//       );
//     }

//     if (activeList === "proposals" || activeList === "deals") {
//       const milestoneCount = item.milestones?.length || 0;

//       return (
//         <TouchableOpacity
//           style={styles.card}
//           onPress={() => toggleExpand(item.id)}
//           activeOpacity={0.8}
//         >
//           <View style={styles.cardHeader}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.itemTitle} numberOfLines={1}>
//                 {item.projectTitle}
//               </Text>
//               {/* <Text style={styles.itemMeta}>
//                 {milestoneCount} Milestones •{" "}
//                 {activeList === "proposals" ? "Created" : "Funded"}:{" "}
//                 {formatDate(item.createdAt || item.fundedAt)}
//               </Text> */}
//             </View>
//             <View style={{ alignItems: "flex-end" }}>
//               <Text style={styles.itemAmount}>
//                 {formatCurrency(item.totalAmount)}
//               </Text>
//               <Ionicons
//                 name={isExpanded ? "chevron-up" : "chevron-down"}
//                 size={20}
//                 color="#999"
//               />
//             </View>
//           </View>

//           {isExpanded && (
//             <View style={styles.expandedContent}>
//               <View style={styles.divider} />
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Status:</Text>
//                 <Text style={styles.detailValue}>{item.status}</Text>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Buyer:</Text>
//                 <Text style={styles.detailValue}>
//                   {item.buyerEmail || "N/A"}
//                 </Text>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Seller:</Text>
//                 <Text style={styles.detailValue}>
//                   {item.sellerEmail || "N/A"}
//                 </Text>
//               </View>

//               {/* <View style={styles.divider} />
//               <Text style={styles.sectionHeader}>Milestones & Amounts</Text>
//               {item.milestones && Array.isArray(item.milestones) ? (
//                 item.milestones.map((m, idx) => (
//                   <View key={idx} style={styles.milestoneRow}>
//                     <Text style={styles.milestoneIndex}>#{idx + 1}</Text>
//                     <View style={{ flex: 1, marginHorizontal: 10 }}>
//                       <Text style={styles.milestoneTitle}>{m.title}</Text>
//                       <Text style={styles.milestoneStatus}>
//                         Due: {formatDate(m.dueDate)}
//                       </Text>
//                     </View>
//                     <Text style={styles.milestoneAmount}>
//                       {formatCurrency(m.amount)}
//                     </Text>
//                   </View>
//                 ))
//               ) : (
//                 <Text style={styles.itemMeta}>No milestones found</Text>
//               )} */}
//             </View>
//           )}
//         </TouchableOpacity>
//       );
//     }

//     if (activeList === "disputes") {
//       return (
//         <TouchableOpacity
//           style={styles.card}
//           onPress={() => toggleExpand(item.id)}
//           activeOpacity={0.8}
//         >
//           <View style={styles.cardHeader}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.itemTitle}>{item.projectTitle}</Text>
//               <Text style={styles.itemSub}>
//                 Raised By: {item.raisedByEmail}
//               </Text>
//               <Text style={styles.itemMeta}>
//                 Date: {formatDate(item.createdAt)}
//               </Text>
//             </View>
//             <View style={{ alignItems: "flex-end" }}>
//               <View style={[styles.badge, styles.badgeDanger]}>
//                 <Text style={styles.textDanger}>DISPUTE</Text>
//               </View>
//             </View>
//           </View>

//           {isExpanded && (
//             <View style={styles.expandedContent}>
//               <View style={styles.divider} />
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Milestone Index:</Text>
//                 <Text style={styles.detailValue}>
//                   #{Number(item.milestoneIndex) + 1}
//                 </Text>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Buyer:</Text>
//                 <Text style={styles.detailValue}>{item.buyerEmail}</Text>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailLabel}>Seller:</Text>
//                 <Text style={styles.detailValue}>{item.sellerEmail}</Text>
//               </View>
//               <View style={styles.detailBlock}>
//                 <Text style={styles.detailLabel}>Reason:</Text>
//                 <Text style={styles.reasonText}>{item.reason}</Text>
//               </View>
//             </View>
//           )}
//         </TouchableOpacity>
//       );
//     }

//     if (activeList === "messages") {
//       return (
//         <TouchableOpacity
//           style={styles.card}
//           onPress={() => toggleExpand(item.id)}
//           activeOpacity={0.8}
//         >
//           <View style={styles.cardHeader}>
//             <View style={{ flex: 1, marginRight: 10 }}>
//               <Text style={styles.itemTitle}>{item.name}</Text>
//               <Text
//                 style={styles.itemSub}
//                 numberOfLines={isExpanded ? undefined : 1}
//               >
//                 {item.message}
//               </Text>
//             </View>
//             <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
//           </View>
//           {isExpanded && (
//             <View style={styles.expandedContent}>
//               <Text style={styles.itemMeta}>
//                 {item.email} • {item.phone}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       );
//     }

//     return null;
//   };

//   const listLabels = {
//     users: "Users",
//     proposals: "Proposals",
//     deals: "Deals",
//     disputes: "Disputes",
//     messages: "Support Messages",
//   };

//   if (loading || authLoading)
//     return (
//       <ActivityIndicator style={styles.centered} size="large" color="#003366" />
//     );

//   return (
//     <View style={styles.container}>
//       {/* Fixed Header (Title & Back Button) */}
//       <View style={styles.headerContainer}>
//         <View style={styles.navRow}>
//           <TouchableOpacity
//             onPress={() => router.push("/(tabs)/dashboard/profile")}
//             style={styles.backButton}
//           >
//             <Ionicons name="arrow-back" size={24} color="#003366" />
//           </TouchableOpacity>
//           <Text style={styles.pageTitle}>Admin Dashboard</Text>
//         </View>
//       </View>

//       {/* Main Content List with Refresh Control */}
//       <FlatList
//         data={filteredData}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListHeaderComponent={renderDashboardHeader} // Stats & Controls here
//         ListEmptyComponent={
//           <Text style={styles.empty}>
//             {searchText ? "No matches found." : "No records found."}
//           </Text>
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={["#003366"]} // Android
//             tintColor="#003366" // iOS
//           />
//         }
//       />

//       {/* Dropdown Modal */}
//       <Modal
//         visible={showDropdown}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowDropdown(false)}
//       >
//         <Pressable
//           style={styles.modalOverlay}
//           onPress={() => setShowDropdown(false)}
//         >
//           <View style={styles.dropdownMenu}>
//             <Text style={styles.dropdownHeader}>Select Category</Text>
//             {Object.entries(listLabels).map(([key, label]) => (
//               <TouchableOpacity
//                 key={key}
//                 style={[
//                   styles.dropdownItem,
//                   activeList === key && styles.dropdownItemActive,
//                 ]}
//                 onPress={() => {
//                   setActiveList(key);
//                   setShowDropdown(false);
//                   setSearchText(""); // Reset search on change
//                 }}
//               >
//                 <Text
//                   style={[
//                     styles.dropdownText,
//                     activeList === key && styles.dropdownTextActive,
//                   ]}
//                 >
//                   {label}
//                 </Text>
//                 {activeList === key && (
//                   <Ionicons name="checkmark" size={18} color="#003366" />
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>
//         </Pressable>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8f9fa" },
//   centered: { flex: 1, justifyContent: "center" },

//   // Header
//   headerContainer: {
//     paddingHorizontal: 20,
//     paddingTop: 10,
//     paddingBottom: 10,
//     backgroundColor: "#f8f9fa",
//   },
//   navRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   backButton: {
//     padding: 8,
//     marginRight: 12,
//     borderRadius: 8,
//     backgroundColor: "#fff",
//     elevation: 1,
//   },
//   pageTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#003366",
//   },

//   // Stats Grid
//   statsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },
//   statCard: {
//     width: "48%",
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   statTitle: { fontSize: 12, color: "#666", marginTop: 8 },
//   statValue: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 4 },

//   // Controls Section
//   controlsSection: {
//     marginTop: 10,
//     marginBottom: 20,
//     gap: 10,
//   },
//   selectButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   selectButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#003366",
//   },
//   searchBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     height: 45,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 14,
//     color: "#333",
//   },

//   // Dropdown Modal
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dropdownMenu: {
//     width: "80%",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 10,
//     elevation: 5,
//   },
//   dropdownHeader: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#94a3b8",
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f5f9",
//     marginBottom: 5,
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//   },
//   dropdownItemActive: {
//     backgroundColor: "#f0f9ff",
//   },
//   dropdownText: {
//     fontSize: 16,
//     color: "#334155",
//   },
//   dropdownTextActive: {
//     color: "#003366",
//     fontWeight: "600",
//   },

//   // List Items
//   listContent: { paddingHorizontal: 20, paddingBottom: 40 },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     marginBottom: 12,
//     padding: 16,
//     elevation: 1,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },

//   // Text Styles
//   itemTitle: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: "#1e293b",
//     marginBottom: 2,
//   },
//   itemSub: { fontSize: 13, color: "#64748b", marginBottom: 2 },
//   itemMeta: { fontSize: 11, color: "#94a3b8" },
//   itemAmount: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#003366",
//     marginBottom: 4,
//   },
//   itemDate: {
//     fontSize: 11,
//     color: "#94a3b8",
//     minWidth: 70,
//     textAlign: "right",
//   },

//   // Expandable Section
//   expandedContent: {
//     marginTop: 12,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#f1f5f9",
//     marginVertical: 10,
//   },
//   detailRow: {
//     flexDirection: "row",
//     marginBottom: 6,
//   },
//   detailBlock: {
//     marginTop: 6,
//   },
//   detailLabel: {
//     width: 80,
//     fontSize: 12,
//     color: "#94a3b8",
//     fontWeight: "500",
//   },
//   detailValue: {
//     flex: 1,
//     fontSize: 12,
//     color: "#334155",
//     fontWeight: "500",
//   },
//   reasonText: {
//     marginTop: 2,
//     fontSize: 13,
//     color: "#ef4444",
//     fontStyle: "italic",
//     backgroundColor: "#fef2f2",
//     padding: 8,
//     borderRadius: 6,
//   },

//   // Milestones
//   sectionHeader: {
//     fontSize: 13,
//     fontWeight: "bold",
//     color: "#003366",
//     marginBottom: 8,
//   },
//   milestoneRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f8fafc",
//   },
//   milestoneIndex: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#94a3b8",
//     width: 25,
//   },
//   milestoneTitle: {
//     fontSize: 13,
//     color: "#334155",
//     fontWeight: "500",
//   },
//   milestoneStatus: {
//     fontSize: 10,
//     color: "#64748b",
//   },
//   milestoneAmount: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#059669",
//   },

//   // Badges
//   badge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//     alignSelf: "flex-start",
//   },
//   badgeSuccess: { backgroundColor: "#dcfce7" },
//   badgePending: { backgroundColor: "#f1f5f9" },
//   badgeDanger: { backgroundColor: "#fee2e2" },
//   textSuccess: { fontSize: 10, fontWeight: "bold", color: "#16a34a" },
//   textPending: { fontSize: 10, fontWeight: "bold", color: "#64748b" },
//   textDanger: { fontSize: 10, fontWeight: "bold", color: "#ef4444" },

//   empty: { textAlign: "center", marginTop: 50, color: "#94a3b8" },
// });

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
  RefreshControl,
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
    special_clients: [],
    fraud_reviews: [], // New state for flagged deals
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & UI State
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false); // Flag deal modal
  const [newEmail, setNewEmail] = useState("");
  const [flagDealId, setFlagDealId] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
    if (!refreshing) setLoading(true);
    try {
      const [
        statsRes,
        usersRes,
        proposalsRes,
        dealsRes,
        disputesRes,
        contactRes,
        specialRes,
        reviewRes, // New request
      ] = await Promise.all([
        apiClient.get("/admin/dashboard-stats"),
        apiClient.get("/admin/users"),
        apiClient.get("/admin/proposals"),
        apiClient.get("/admin/deals"),
        apiClient.get("/admin/disputes"),
        apiClient.get("/admin/contact-submissions"),
        apiClient
          .get("/admin/special-clients")
          .catch(() => ({ data: { clients: [] } })),
        apiClient
          .get("/admin/fraud-reviews")
          .catch(() => ({ data: { reviews: [] } })), // New endpoint
      ]);

      setStats(statsRes.data.stats);
      setData({
        users: usersRes.data.users || [],
        proposals: proposalsRes.data.proposals || [],
        deals: dealsRes.data.deals || [],
        disputes: disputesRes.data.disputes || [],
        messages: contactRes.data.submissions || [],
        special_clients: specialRes.data.clients || [],
        fraud_reviews: reviewRes.data.reviews || [],
      });
    } catch (err) {
      console.error("Admin fetch error:", err);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAdminData();
  }, []);

  // --- ACTIONS ---
  const handleAddSpecial = async () => {
    if (!newEmail.includes("@"))
      return Alert.alert("Error", "Enter valid email");
    setActionLoading(true);
    try {
      await apiClient.post("/admin/special-clients", { email: newEmail });
      Alert.alert("Success", "User whitelisted.");
      setNewEmail("");
      setShowAddModal(false);
      fetchAdminData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlagDeal = async () => {
    if (!flagDealId) return Alert.alert("Error", "Deal ID required");
    setActionLoading(true);
    // Try to find the title from deals list if it exists
    const deal = data.deals.find((d) => d.id === flagDealId);
    try {
      await apiClient.post("/admin/fraud-reviews", {
        dealId: flagDealId,
        reason: flagReason,
        projectTitle: deal?.projectTitle,
      });
      Alert.alert("Success", "Deal flagged for investigation.");
      setFlagDealId("");
      setFlagReason("");
      setShowFlagModal(false);
      fetchAdminData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveReview = (dealId) => {
    Alert.alert("Remove Review", "Remove this deal from fraud investigation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/admin/fraud-reviews/${dealId}`);
            fetchAdminData();
          } catch (e) {
            Alert.alert("Error", "Failed to remove");
          }
        },
      },
    ]);
  };

  const handleRemoveSpecial = (email) => {
    Alert.alert("Remove Whitelist", `Remove ${email}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/admin/special-clients/${email}`);
            fetchAdminData();
          } catch (err) {
            Alert.alert("Error", "Failed to remove");
          }
        },
      },
    ]);
  };

  const formatCurrency = (val) =>
    `₦${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  const filteredData = useMemo(() => {
    const list = data[activeList] || [];
    if (!searchText) return list;
    const lowerSearch = searchText.toLowerCase();
    return list.filter((item) => {
      return (
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.email?.toLowerCase().includes(lowerSearch) ||
        item.projectTitle?.toLowerCase().includes(lowerSearch) ||
        item.dealId?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, activeList, searchText]);

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

    if (activeList === "special_clients") {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.itemTitle}>{item.email}</Text>
              <Text style={styles.itemMeta}>
                Whitelisted: {formatDate(item.addedAt)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveSpecial(item.email)}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (activeList === "fraud_reviews") {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>ID: {item.dealId}</Text>
              <Text style={styles.itemSub}>{item.projectTitle}</Text>
              <Text style={styles.reasonText}>Reason: {item.reason}</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemoveReview(item.dealId)}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#16a34a"
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (activeList === "proposals" || activeList === "deals") {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.projectTitle}
              </Text>
              <Text style={styles.itemSub}>{item.status}</Text>
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
                <Text style={styles.detailLabel}>Buyer:</Text>
                <Text style={styles.detailValue}>{item.buyerEmail}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seller:</Text>
                <Text style={styles.detailValue}>{item.sellerEmail}</Text>
              </View>
              <Text style={[styles.itemMeta, { marginTop: 5 }]}>
                ID: {item.id}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (activeList === "disputes") {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.projectTitle}</Text>
              <Text style={styles.itemSub}>
                Raised by: {item.raisedByEmail}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeDanger]}>
              <Text style={styles.textDanger}>DISPUTE</Text>
            </View>
          </View>
          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />
              <Text style={styles.detailLabel}>Reason:</Text>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (activeList === "messages") {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSub} numberOfLines={isExpanded ? 0 : 1}>
                {item.message}
              </Text>
            </View>
            <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
          </View>
          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />
              <Text style={styles.itemMeta}>
                {item.email} • {item.phone}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
  };

  const listLabels = {
    users: "Users",
    special_clients: "Special Clients",
    fraud_reviews: "Fraud Review",
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

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.statsGrid}>
              {[
                {
                  t: "Total Users",
                  v: stats?.totalUsers || 0,
                  i: "people",
                  c: "#3b82f6",
                },
                {
                  t: "Active Deals",
                  v: stats?.totalDeals || 0,
                  i: "briefcase",
                  c: "#a855f7",
                },
                {
                  t: "Revenue",
                  v: formatCurrency(stats?.totalRevenue),
                  i: "cash",
                  c: "#f97316",
                },
                {
                  t: "Disputes",
                  v: stats?.totalDisputes || 0,
                  i: "alert-circle",
                  c: "#ef4444",
                },
              ].map((s, idx) => (
                <View
                  key={idx}
                  style={[styles.statCard, { borderLeftColor: s.c }]}
                >
                  <Ionicons name={s.i} size={20} color={s.c} />
                  <Text style={styles.statTitle}>{s.t}</Text>
                  <Text style={styles.statValue}>{s.v}</Text>
                </View>
              ))}
            </View>

            <View style={styles.controlsSection}>
              <View style={styles.headerRow}>
                <TouchableOpacity
                  style={[styles.selectButton, { flex: 1 }]}
                  onPress={() => setShowDropdown(true)}
                >
                  <Text style={styles.selectButtonText}>
                    {listLabels[activeList]}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#003366" />
                </TouchableOpacity>
                {activeList === "special_clients" && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
                {activeList === "fraud_reviews" && (
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: "#ef4444" }]}
                    onPress={() => setShowFlagModal(true)}
                  >
                    <Ionicons name="alert" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#94a3b8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${listLabels[activeList]}...`}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#003366"]}
          />
        }
      />

      {/* Categories Dropdown */}
      <Modal visible={showDropdown} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
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
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal: Whitelist User */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addModal}>
            <Text style={styles.modalTitle}>Whitelist User</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="email@domain.com"
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.cancelBtn}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddSpecial}
                style={styles.saveBtn}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff" }}>Whitelist</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Flag Deal */}
      <Modal visible={showFlagModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.addModal}>
            <Text style={[styles.modalTitle, { color: "#ef4444" }]}>
              Flag Deal ID
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Deal ID (e.g. ABC-123)"
              value={flagDealId}
              onChangeText={setFlagDealId}
              autoCapitalize="characters"
            />
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="Reason for review"
              value={flagReason}
              onChangeText={setFlagReason}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowFlagModal(false)}
                style={styles.cancelBtn}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFlagDeal}
                style={[styles.saveBtn, { backgroundColor: "#ef4444" }]}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff" }}>Flag Deal</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center" },
  headerContainer: { paddingHorizontal: 20, paddingTop: 10 },
  navRow: { flexDirection: "row", alignItems: "center" },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    elevation: 1,
  },
  pageTitle: { fontSize: 22, fontWeight: "bold", color: "#003366" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 20,
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
  statTitle: { fontSize: 11, color: "#666", marginTop: 5 },
  statValue: { fontSize: 15, fontWeight: "bold", color: "#333" },
  controlsSection: { paddingHorizontal: 20, marginVertical: 15, gap: 10 },
  headerRow: { flexDirection: "row", gap: 10 },
  addButton: {
    backgroundColor: "#003366",
    width: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectButtonText: { fontSize: 16, fontWeight: "600", color: "#003366" },
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
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
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
  },
  dropdownItem: { padding: 16 },
  dropdownItemActive: { backgroundColor: "#f0f9ff", borderRadius: 8 },
  dropdownText: { fontSize: 16, color: "#334155" },
  dropdownTextActive: { color: "#003366", fontWeight: "600" },
  listContent: { paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitle: { fontSize: 15, fontWeight: "bold", color: "#1e293b" },
  itemSub: { fontSize: 13, color: "#64748b" },
  itemMeta: { fontSize: 11, color: "#94a3b8" },
  itemAmount: { fontSize: 14, fontWeight: "bold", color: "#003366" },
  itemDate: {
    fontSize: 11,
    color: "#94a3b8",
    minWidth: 60,
    textAlign: "right",
  },
  expandedContent: { marginTop: 10 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 8 },
  detailRow: { flexDirection: "row", marginBottom: 4 },
  detailLabel: { width: 60, fontSize: 12, color: "#94a3b8" },
  detailValue: { flex: 1, fontSize: 12, color: "#334155" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeSuccess: { backgroundColor: "#dcfce7" },
  badgePending: { backgroundColor: "#f1f5f9" },
  badgeDanger: { backgroundColor: "#fee2e2" },
  textSuccess: { fontSize: 10, color: "#16a34a", fontWeight: "bold" },
  textPending: { fontSize: 10, color: "#64748b", fontWeight: "bold" },
  textDanger: { fontSize: 10, color: "#ef4444", fontWeight: "bold" },
  reasonText: {
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 6,
    fontSize: 12,
    color: "#ef4444",
    fontStyle: "italic",
    marginTop: 5,
  },
  addModal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, alignItems: "center", padding: 10 },
  saveBtn: {
    flex: 1,
    backgroundColor: "#003366",
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
  },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
