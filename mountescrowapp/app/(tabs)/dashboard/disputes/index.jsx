import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useAuth } from "../../../../contexts/AuthContexts";
import apiClient from "../../../../src/api/apiClient";

export default function DisputesScreen() {
  const { user, loading: authLoading } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("disputes/my");
      setDisputes(res.data.disputes || []);
    } catch (err) {
      console.error("Fetch disputes error:", err.message);
      Alert.alert("Error", "Could not load disputes history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDisputes();
  }, [user, fetchDisputes]);

  const handleMarkResolved = async (disputeId) => {
    setResolvingId(disputeId);
    try {
      await apiClient.post(`/disputes/${disputeId}/resolve`);
      Alert.alert("Success", "Dispute marked as resolved.");

      setDisputes((prev) =>
        prev.map((d) => (d.id === disputeId ? { ...d, status: "resolved" } : d))
      );
    } catch (err) {
      Alert.alert("Failed", "Could not update dispute status.");
    } finally {
      setResolvingId(null);
    }
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
    return date && !isNaN(date) ? format(date, "PPP") : "N/A";
  };

  const renderDispute = ({ item }) => {
    const isRaisedByMe = item.raisedByEmail === user?.email;
    const milestoneLabel =
      item.milestoneIndex !== undefined && item.milestoneIndex !== null
        ? `Milestone ${Number(item.milestoneIndex) + 1}`
        : "General Project";

    const isResolved = item.status === "resolved";

    return (
      <View style={styles.disputeCard}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.roleBadge,
                isRaisedByMe ? styles.roleOwn : styles.roleOther,
              ]}
            >
              <Text style={styles.roleText}>
                {isRaisedByMe ? "Raised by You" : "Raised Against You"}
              </Text>
            </View>
            <Text style={styles.projectTitle}>{item.projectTitle}</Text>
            <Text style={styles.dateLabel}>
              Raised: {formatDate(item.createdAt)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isResolved ? styles.bgSuccess : styles.bgPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isResolved ? styles.textSuccess : styles.textPending,
              ]}
            >
              {item.status?.replace("_", " ")}
            </Text>
          </View>
        </View>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Disputed Target:</Text>
            <Text style={styles.detailValue}>{milestoneLabel}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deal ID:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.dealId}
            </Text>
          </View>
        </View>

        <Text style={styles.reasonLabel}>Reason for Dispute:</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>

        {item.files?.length > 0 && (
          <View style={styles.filesSection}>
            <Text style={styles.fileHeader}>Attached Proof:</Text>
            <View style={styles.fileGrid}>
              {item.files.map((url, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.fileChip}
                  onPress={() => Linking.openURL(url)}
                >
                  <Ionicons
                    name="document-attach-outline"
                    size={14}
                    color="#003366"
                  />
                  <Text style={styles.fileChipText}>File {i + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {isRaisedByMe && !isResolved && (
          <TouchableOpacity
            style={styles.resolveBtn}
            onPress={() => handleMarkResolved(item.id)}
            disabled={resolvingId === item.id}
          >
            {resolvingId === item.id ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="checkmark-done-circle" size={18} color="#fff" />
                <Text style={styles.resolveBtnText}>Mark as Resolved</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={disputes}
        renderItem={renderDispute}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Disputes Found</Text>
            <Text style={styles.emptySub}>
              Disputes involving you will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16, paddingBottom: 40 },
  disputeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  roleOwn: { backgroundColor: "#eef2ff" },
  roleOther: { backgroundColor: "#fef2f2" },
  roleText: { fontSize: 10, fontWeight: "700", color: "#003366" },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 4,
  },
  dateLabel: { fontSize: 12, color: "#999" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bgPending: { backgroundColor: "#fff7ed" },
  bgSuccess: { backgroundColor: "#dcfce7" },
  statusText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
  textPending: { color: "#f97316" },
  textSuccess: { color: "#16a34a" },
  detailsBox: {
    backgroundColor: "#f1f3f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: { fontSize: 12, color: "#666", fontWeight: "600" },
  detailValue: {
    fontSize: 12,
    color: "#333",
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 16,
  },
  filesSection: { marginBottom: 16 },
  fileHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    marginBottom: 8,
  },
  fileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  fileChipText: { fontSize: 12, color: "#003366", fontWeight: "600" },
  resolveBtn: {
    backgroundColor: "#003366",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  resolveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySub: { fontSize: 14, color: "#999", marginTop: 8 },
});
