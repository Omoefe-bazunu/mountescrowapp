import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../../../../../src/api/apiClient";
import { SubmitWorkModal } from "./SubmitWorkModal";
import { RequestRevisionModal } from "./RequestRevisionModal";

export function MilestoneCard({
  milestone,
  milestoneIndex,
  dealId,
  isBuyer,
  isSeller,
  dealStatus,
  onUpdate,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await apiClient.post(
        `/deals/${dealId}/milestones/${milestoneIndex}/approve`
      );
      Alert.alert("Approved", "Payment released to seller.");
      onUpdate();
    } catch (e) {
      Alert.alert("Error", "Could not approve milestone.");
    } finally {
      setIsProcessing(false);
    }
  };

  const canSubmit =
    isSeller &&
    dealStatus === "In Progress" &&
    (milestone.status === "Funded" ||
      milestone.status === "Revision Requested");

  return (
    <View style={styles.card}>
      {/* Milestone Details */}
      <View style={styles.header}>
        <Text style={styles.title}>
          M{milestoneIndex + 1}: {milestone.title}
        </Text>
        <Text style={styles.amount}>₦{milestone.amount.toLocaleString()}</Text>
      </View>
      <Text style={styles.desc}>{milestone.description}</Text>

      {/* Seller's Submission  */}
      {milestone.submission?.message && (
        <View style={styles.submissionBox}>
          <Text style={styles.submissionLabel}>Seller&apos;s Submission:</Text>
          <Text style={styles.submissionText}>
            {milestone.submission.message}
          </Text>

          {milestone.submission.files?.length > 0 && (
            <View style={styles.fileContainer}>
              {milestone.submission.files.map((file, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => Linking.openURL(file.url)} // ALWAYS use file.url from the backend response [cite: 188]
                >
                  <Text>{file.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Revision Request View [cite: 192-193] */}
      {milestone.revisionRequest?.message && (
        <View style={styles.revisionBox}>
          <Text style={styles.revisionLabel}>Revision Requested:</Text>
          <Text style={styles.revisionText}>
            {milestone.revisionRequest.message}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {canSubmit && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setSubmitModalOpen(true)}
          >
            <Text style={styles.buttonText}>
              {milestone.status === "Revision Requested"
                ? "Resubmit Work"
                : "Submit Work"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Buyer Actions: Approve or Reject [cite: 195-197] */}
        {isBuyer && milestone.status === "Submitted for Approval" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => setRevisionModalOpen(true)}
            >
              <Text style={styles.rejectText}>Request Revision</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Approve</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <SubmitWorkModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        dealId={dealId}
        milestoneIndex={milestoneIndex}
        onSuccess={onUpdate}
      />
      <RequestRevisionModal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        dealId={dealId}
        milestoneIndex={milestoneIndex}
        onSuccess={onUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "bold" },
  amount: { fontWeight: "bold", color: "#f97316" },
  desc: { color: "#666", fontSize: 14, marginBottom: 12 },

  submissionBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  submissionLabel: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 4,
    color: "#374151",
  },
  submissionText: { fontSize: 14, color: "#4b5563", marginBottom: 10 },
  fileContainer: { gap: 8 },
  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  fileName: { fontSize: 12, color: "#003366", fontWeight: "600" },
  subLabel: {
    fontWeight: "bold",
    color: "#334155",
    fontSize: 13,
    marginBottom: 4,
  },
  subMessage: { color: "#475569", fontSize: 13, marginBottom: 8 },
  fileLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  fileText: { color: "#003366", fontSize: 12, textDecorationLine: "underline" },
  revisionBox: {
    backgroundColor: "#fff1f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  revisionLabel: {
    fontWeight: "bold",
    color: "#be123c",
    fontSize: 13,
    marginBottom: 4,
  },
  revisionText: { color: "#9f1239", fontSize: 13 },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  approveBtn: { backgroundColor: "#16a34a" },
  rejectBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  button: {
    backgroundColor: "#003366",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  rejectText: { color: "#dc2626", fontWeight: "bold" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
