import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import apiClient from "../../../../../../src/api/apiClient";

export function RequestRevisionModal({
  isOpen,
  onClose,
  dealId,
  milestoneIndex,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (reason.length < 10)
      return Alert.alert(
        "Error",
        "Please provide a more detailed reason (min 10 chars)."
      );

    setLoading(true);
    try {
      // 1. Submit the milestone revision/rejection request [cite: 450, 455]
      await apiClient.post(
        `/deals/${dealId}/milestones/${milestoneIndex}/reject`,
        { reason }
      );

      // 2. Automatically stop the countdown timer [cite: 489, 491]
      try {
        await apiClient.post(
          `/deals/${dealId}/milestones/${milestoneIndex}/cancel-countdown`
        );
      } catch (countdownErr) {
        // Log locally if countdown stop fails, but don't block the success alert
        console.warn("Countdown cancellation failed:", countdownErr.message);
      }

      Alert.alert(
        "Success",
        "Revision requested and timer stopped. Seller has been notified."
      );

      onSuccess();
      onClose();
      setReason("");
    } catch (error) {
      Alert.alert("Error", "Failed to request revision.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Request Revision</Text>
          <Text style={styles.subtitle}>
            Explain what changes are needed. This will notify the seller and
            pause the auto-approval timer.
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="e.g. Please change the background color to blue..."
            multiline
            value={reason}
            onChangeText={setReason}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 25,
  },
  content: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 8,
  },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 15 },
  textArea: {
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cancelBtn: { marginRight: 20 },
  cancelText: { color: "#666", fontWeight: "600" },
  submitBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});
