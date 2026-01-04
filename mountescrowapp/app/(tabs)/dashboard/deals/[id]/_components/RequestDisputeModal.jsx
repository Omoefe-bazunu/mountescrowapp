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
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { createDispute } from "../../../../../../src/services/dispute.service";
import { AppText } from "../../../../../../components/ui/AppText";

export function RequestDisputeModal({
  isOpen,
  onClose,
  dealId,
  projectTitle, // Added to fix missing fields in the backend payload
  milestones,
  onSuccess,
}) {
  const [milestoneIndex, setMilestoneIndex] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (milestoneIndex === "") {
      return Alert.alert("Error", "Please select a milestone to dispute.");
    }
    if (reason.trim().length < 10) {
      return Alert.alert("Error", "Reason must be at least 10 characters.");
    }

    setLoading(true);
    try {
      // Updated to pass projectTitle as required by the backend service
      await createDispute(dealId, milestoneIndex, reason, projectTitle);

      Alert.alert(
        "Success",
        "Dispute raised. Admin and counterparty notified."
      );
      onSuccess();
      handleClose();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setMilestoneIndex("");
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <AppText style={styles.title}>Raise a Dispute</AppText>

          <AppText style={styles.label}>Select Milestone</AppText>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={milestoneIndex}
              onValueChange={(val) => setMilestoneIndex(val)}
            >
              <Picker.Item label="Select milestone..." value="" />
              {milestones.map((m, i) => (
                <Picker.Item
                  key={i}
                  label={`Milestone ${i + 1}: ${m.title}`}
                  value={String(i)}
                />
              ))}
            </Picker>
          </View>

          <AppText style={styles.label}>Reason</AppText>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={5}
            value={reason}
            onChangeText={setReason}
            placeholder="Explain the issue..."
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
              <AppText style={styles.cancelText}>Cancel</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText style={styles.submitText}>Submit</AppText>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  content: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 15,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 15 },
  cancelBtn: { padding: 10 },
  cancelText: { color: "#666", fontWeight: "600" },
  submitBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
});
