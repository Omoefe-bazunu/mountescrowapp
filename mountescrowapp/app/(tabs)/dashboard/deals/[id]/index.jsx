import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl, // Added import
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useAuth } from "../../../../../contexts/AuthContexts";
import apiClient from "../../../../../src/api/apiClient";
import { MilestoneCard } from "./_components/MilestoneCard";
import { CountdownBanner } from "./_components/CountdownBanner";
import { RequestDisputeModal } from "./_components/RequestDisputeModal";
import { AppText } from "../../../../../components/ui/AppText";

const formatNumber = (num) => {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Added state
  const [isProcessing, setIsProcessing] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);

  const fetchDeal = async () => {
    try {
      const res = await apiClient.get(`/deals/${id}`);
      setDeal(res.data.deal);
    } catch (err) {
      Alert.alert("Error", "Deal not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeal();
  }, [id]);

  // Added onRefresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeal();
    setRefreshing(false);
  }, [id]);

  const handleFundDeal = async () => {
    if (!deal) return;

    setIsProcessing(true);
    try {
      // Calls the funding endpoint
      const res = await apiClient.post(`/deals/${id}/fund`);

      Alert.alert(
        "Success",
        "Deal Funded Successfully! Funds deducted and seller notified."
      );

      // Refresh deal data to update UI status
      fetchDeal();
    } catch (e) {
      console.error("Funding Error:", e.response?.data || e.message);
      Alert.alert(
        "Funding Failed",
        e.response?.data?.error || "Insufficient balance or transaction error."
      );
    } finally {
      setIsProcessing(false);
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

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#f97316" />
    );
  if (!deal) return <AppText>Deal not found</AppText>;

  const completed =
    deal.milestones.filter((m) => m.status === "Completed").length || 0;
  const total = deal.milestones.length || 0;
  const progress = total ? completed / total : 0; // For Progress Bar

  const isBuyer = user?.uid === deal.buyerId || user?.email === deal.buyerEmail;
  const isSeller = user?.email === deal.sellerEmail;
  const canRaiseDispute =
    (isBuyer || isSeller) &&
    deal.status !== "Completed" &&
    deal.status !== "In Dispute";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      } // Added RefreshControl
    >
      {/* Header */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.title}>{deal.projectTitle}</AppText>
            <AppText style={styles.dateSub}>
              Created on {formatDate(deal.createdAt)}
            </AppText>
          </View>
          <View style={styles.statusBadge}>
            <AppText style={styles.statusText}>{deal.status}</AppText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <AppText style={styles.progressLabel}>Progress</AppText>
            <AppText style={styles.progressCount}>
              {completed} / {total} Completed
            </AppText>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>
      </View>

      {/* Countdown Banners */}
      {deal.milestones.map(
        (m, i) =>
          (m.countdownActive || m.countdownCancelledAt) && (
            <CountdownBanner
              key={i}
              milestone={m}
              dealId={id}
              milestoneIndex={i}
              isBuyer={isBuyer}
              onUpdate={fetchDeal}
            />
          )
      )}

      {/* Funding Button */}
      {isBuyer && deal.status === "Awaiting Funding" && (
        <TouchableOpacity
          style={styles.fundButton}
          onPress={handleFundDeal}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={styles.fundText}>
              Fund Deal Now (₦
              {formatNumber(
                deal.totalAmount + deal.escrowFee * (deal.escrowFeePayer / 100)
              )}
              )
            </AppText>
          )}
        </TouchableOpacity>
      )}

      {/* Milestones */}
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>Milestones</AppText>
        {deal.milestones.map((m, i) => (
          <MilestoneCard
            key={i}
            milestone={m}
            dealId={id}
            milestoneIndex={i}
            isBuyer={isBuyer}
            isSeller={isSeller}
            dealStatus={deal.status}
            onUpdate={fetchDeal}
          />
        ))}
      </View>

      {/* Raise Dispute */}
      {canRaiseDispute && (
        <TouchableOpacity
          style={styles.disputeButton}
          onPress={() => setDisputeModalOpen(true)}
        >
          <Ionicons name="alert-circle" size={20} color="#fff" />
          <AppText style={styles.disputeText}>Raise a Dispute</AppText>
        </TouchableOpacity>
      )}

      {/* Financial Summary Breakdown */}
      <View style={styles.card}>
        <AppText style={styles.summaryTitle}>Summary</AppText>
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Total Project Amount</AppText>
          <AppText style={styles.summaryValue}>
            ₦{formatNumber(deal.totalAmount)}
          </AppText>
        </View>
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>Escrow Fee (Excl. VAT)</AppText>
          <AppText style={styles.summaryValue}>
            ₦{formatNumber(deal.escrowFee / 1.075)}
          </AppText>
        </View>
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>VAT (7.5%)</AppText>
          <AppText style={styles.summaryValue}>
            ₦{formatNumber(deal.escrowFee - deal.escrowFee / 1.075)}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>
            Buyer Pays ({deal.escrowFeePayer}%)
          </AppText>
          <AppText style={styles.summaryValue}>
            ₦{formatNumber(deal.escrowFee * (deal.escrowFeePayer / 100))}
          </AppText>
        </View>
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>
            Seller Pays ({100 - deal.escrowFeePayer}%)
          </AppText>
          <AppText style={styles.summaryValue}>
            ₦
            {formatNumber(deal.escrowFee * ((100 - deal.escrowFeePayer) / 100))}
          </AppText>
        </View>
        <View style={[styles.summaryRow, { marginTop: 10 }]}>
          <AppText style={styles.totalLabel}>Amount Buyer Must Fund</AppText>
          <AppText style={styles.totalValue}>
            ₦
            {formatNumber(
              deal.totalAmount + deal.escrowFee * (deal.escrowFeePayer / 100)
            )}
          </AppText>
        </View>
      </View>

      <RequestDisputeModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        dealId={id}
        projectTitle={deal.projectTitle}
        milestones={deal.milestones}
        onSuccess={fetchDeal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#010e5a" },
  dateSub: { fontSize: 13, color: "#666", marginTop: 4 },
  statusBadge: {
    backgroundColor: "#010e5a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  progressSection: { marginTop: 20 },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, color: "#666" },
  progressCount: { fontSize: 14, fontWeight: "600" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#f97316" },
  section: { marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  fundButton: {
    backgroundColor: "#f97316",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  fundText: { color: "#fff", fontWeight: "bold" },
  disputeButton: {
    backgroundColor: "#dc2626",
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  disputeText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  summaryTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { color: "#666" },
  summaryValue: { fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#f97316" },
});
