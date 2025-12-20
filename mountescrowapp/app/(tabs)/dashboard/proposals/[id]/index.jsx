import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useAuth } from "../../../../../contexts/AuthContexts";
import {
  getProposalById,
  updateProposalStatus,
  acceptAndFundSellerInitiatedProposal,
} from "../../../../../src/services/proposal.service";
import { createDealFromProposal } from "../../../../../src/services/deal.service";

const formatNumber = (num) => {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const p = await getProposalById(id);
        setProposal(p);
      } catch (e) {
        Alert.alert("Error", "Could not load proposal.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const toDate = (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  };

  const getFileNameFromUrl = (url) => {
    try {
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1].split("?")[0];
      return decodeURIComponent(fileName.replace(/^\d+_\d+_/, ""));
    } catch (e) {
      return "Document";
    }
  };

  // Logic Ported from Web [cite: 55-124]
  const isSeller = user?.email === proposal?.sellerEmail;
  const isBuyer =
    user?.uid === proposal?.buyerId || user?.email === proposal?.buyerEmail;
  const canEdit =
    user?.email === proposal?.creatorEmail &&
    ["Pending", "AwaitingBuyerAcceptance"].includes(proposal?.status);

  const buyerEscrowFeePortion = proposal
    ? proposal.escrowFee * (proposal.escrowFeePayer / 100)
    : 0;
  const sellerEscrowFeePortion = proposal
    ? proposal.escrowFee * ((100 - proposal.escrowFeePayer) / 100)
    : 0;

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await updateProposalStatus(id, "Accepted");
      const dealId = await createDealFromProposal(id);
      Alert.alert("Success", "Deal created!");
      router.replace(`/(tabs)/dashboard/deals/`);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAndFund = async () => {
    setIsProcessing(true);
    try {
      const result = await acceptAndFundSellerInitiatedProposal(id, user.uid);
      Alert.alert(
        "Success",
        `Deal created and funded! ₦${formatNumber(
          result.deductedAmount
        )} deducted.`
      );
      router.replace(`/(tabs)/dashboard/deals/`);
    } catch (e) {
      Alert.alert("Error", e.message || "Insufficient balance");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator style={styles.centered} size="large" color="#003366" />
    );
  if (!proposal)
    return (
      <View style={styles.centered}>
        <Text>Proposal not found.</Text>
      </View>
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header Section */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{proposal.projectTitle}</Text>
          {canEdit && (
            <TouchableOpacity
              onPress={() => router.push(`/dashboard/proposals/${id}/edit`)}
            >
              <Ionicons name="create-outline" size={24} color="#f97316" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.statusBadge}>{proposal.status}</Text>
        <Text style={styles.desc}>{proposal.description}</Text>

        <View style={styles.partyRow}>
          <Text style={styles.partyText}>
            <Text style={styles.bold}>Buyer:</Text> {proposal.buyerEmail}
          </Text>
          <Text style={styles.partyText}>
            <Text style={styles.bold}>Seller:</Text> {proposal.sellerEmail}
          </Text>
        </View>
      </View>

      {/* Files Section */}
      {proposal.files?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Files</Text>
          {proposal.files.map((fileUrl, index) => (
            <TouchableOpacity
              key={index}
              style={styles.fileRow}
              onPress={() => Linking.openURL(fileUrl)}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#003366"
              />
              <Text style={styles.fileName} numberOfLines={1}>
                {getFileNameFromUrl(fileUrl)}
              </Text>
              <Ionicons name="eye-outline" size={18} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Milestones Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        {proposal.milestones.map((m, i) => (
          <View key={i} style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>{m.title}</Text>
            <Text style={styles.milestoneDesc}>{m.description}</Text>
            <View style={styles.milestoneFooter}>
              <Text style={styles.milestoneAmount}>
                ₦{formatNumber(m.amount)}
              </Text>
              <Text style={styles.milestoneDate}>
                Due:{" "}
                {m.dueDate ? format(toDate(m.dueDate), "MMM dd, yyyy") : "N/A"}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Financial Summary [cite: 64-65, 116-118] */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Project Amount</Text>
          <Text style={styles.summaryValue}>
            ₦{formatNumber(proposal.totalAmount)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Escrow Fee (incl. VAT)</Text>
          <Text style={styles.summaryValue}>
            ₦{formatNumber(proposal.escrowFee)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Buyer Portion ({proposal.escrowFeePayer}%)
          </Text>
          <Text style={styles.summaryValue}>
            ₦{formatNumber(buyerEscrowFeePortion)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Seller Portion ({100 - proposal.escrowFeePayer}%)
          </Text>
          <Text style={styles.summaryValue}>
            ₦{formatNumber(sellerEscrowFeePortion)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {isSeller && proposal.status === "Pending" && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => Alert.alert("Decline", "Feature coming soon")}
            >
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptText}>Accept & Create Deal</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isBuyer && proposal.status === "AwaitingBuyerAcceptance" && (
          <TouchableOpacity
            style={styles.fundBtn}
            onPress={handleAcceptAndFund}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.acceptText}>Accept & Fund Deal</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#fff", padding: 20, marginBottom: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#003366", flex: 1 },
  statusBadge: {
    backgroundColor: "#e5e7eb",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginVertical: 10,
    fontWeight: "600",
  },
  desc: { fontSize: 15, color: "#666", lineHeight: 22, marginBottom: 15 },
  partyRow: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
  partyText: { fontSize: 13, color: "#444", marginBottom: 4 },
  bold: { fontWeight: "bold" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  fileName: { flex: 1, marginLeft: 10, fontSize: 14, color: "#003366" },
  milestoneCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  milestoneTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  milestoneDesc: { fontSize: 14, color: "#666", marginVertical: 6 },
  milestoneFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  milestoneAmount: { fontWeight: "bold", color: "#003366" },
  milestoneDate: { fontSize: 12, color: "#999" },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  summaryLabel: { fontSize: 14, color: "#666" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  divider: { height: 1, backgroundColor: "#eee", my: 10 },
  actionContainer: { paddingHorizontal: 16 },
  btnRow: { flexDirection: "row", gap: 10 },
  declineBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ef4444",
    alignItems: "center",
  },
  declineText: { color: "#ef4444", fontWeight: "bold" },
  acceptBtn: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#16a34a",
    alignItems: "center",
  },
  fundBtn: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptText: { color: "#fff", fontWeight: "bold" },
});
